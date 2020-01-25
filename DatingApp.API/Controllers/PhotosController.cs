using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private readonly IMapper _mapper;
        private readonly IDatingRepository _datingRepository;
        private Cloudinary _cloudinary;

        public PhotosController(IDatingRepository datingRepository, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _datingRepository = datingRepository;
            _mapper = mapper;
            _cloudinaryConfig = cloudinaryConfig;

            Account cloudinaryAccount = new Account (
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret

            );

            _cloudinary = new Cloudinary(cloudinaryAccount);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await _datingRepository.GetPhoto(id);

            var photo = _mapper.Map<PhotoForReturnDTO>(photoFromRepo);

            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm]PhotoForCreationDTO photoForCreationDTO)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var userFromRepo = await _datingRepository.GetUser(userId);

            var file = photoForCreationDTO.File;

            var uploadResult = new ImageUploadResult();

            if(file.Length > 0) 
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream)
                    };

                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDTO.Url = uploadResult.Uri.ToString();
            photoForCreationDTO.PublicId = uploadResult.PublicId.ToString();

            var photo = _mapper.Map<Photo>(photoForCreationDTO);

            if(!userFromRepo.Photos.Any())
                photo.IsMain = true;

            userFromRepo.Photos.Add(photo);

            if(await _datingRepository.SaveAll())
            {
                var photoToReturn = _mapper.Map<PhotoForReturnDTO>(photo);

                return CreatedAtRoute("GetPhoto", new { userId = userId, id = photo.Id }, photoToReturn);
            }

            return BadRequest();
        }

        [HttpPost("{id}/setMain")]
        /** userId - Current logged in user id
        * id - Photo is which user want to set as main
        */
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var user = await _datingRepository.GetUser(userId);

            if(!user.Photos.Any(p => p.Id == id))
                return Unauthorized();

            var photoFromRepo = await _datingRepository.GetPhoto(id);

            if(photoFromRepo.IsMain) 
                return BadRequest("This is already the main photo");
            
            var currentMainPhoto = await _datingRepository.GetMainPhotoForUser(userId);

            currentMainPhoto.IsMain = false;

            photoFromRepo.IsMain = true;

            if(await _datingRepository.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main");
        }

        /** id - Photo id
        */
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var user = await _datingRepository.GetUser(userId);

            if(!user.Photos.Any(p => p.Id == id))
                return Unauthorized();

            var photoFromRepo = await _datingRepository.GetPhoto(id);

            if(photoFromRepo.IsMain) 
                return BadRequest("You cannot delete your main photo");

            if(photoFromRepo.PublicId != null)
            {
                var deletionParams = new DeletionParams(photoFromRepo.PublicId);
                var deletionResult = _cloudinary.Destroy(deletionParams);

                if(deletionResult.Result == "ok")
                {
                    _datingRepository.Delete(photoFromRepo);
                }
            }

            if(photoFromRepo.PublicId == null)
            {
                _datingRepository.Delete(photoFromRepo);
            }

            if(await _datingRepository.SaveAll())
                return Ok();
            
            return BadRequest("Failed to delete photo");
        }
    }
}