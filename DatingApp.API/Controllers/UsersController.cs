using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository _datingRepository;
        private readonly IMapper _mapper;
        public UsersController(IDatingRepository datingRepository, IMapper mapper)
        {
            _mapper = mapper;
            _datingRepository = datingRepository;
        }

        [HttpGet("getusers")]
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo = await _datingRepository.GetUser(currentUserId);

            userParams.UserId = currentUserId;


            if(string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }

            var users = await _datingRepository.GetUsers(userParams);

            var userToReturn = _mapper.Map<IEnumerable<UserForListsDTO>>(users);

            Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(userToReturn);
        }

        [HttpGet("getuser/{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _datingRepository.GetUser(id);

            var userToReturn = _mapper.Map<UserForDetailsDTO>(user);

            return Ok(userToReturn);
        }

        [HttpPut("updateuser/{id}")]
        public async Task<IActionResult> UpdateUsers(int id, UserForUpdateDTO userForUpdateDTO)
        {
            if(id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var userFromRepo = await _datingRepository.GetUser(id);

            _mapper.Map(userForUpdateDTO, userFromRepo);

            if(await _datingRepository.SaveAll())
                return NoContent();

            throw new Exception($"Updating user {id} failed on save.");
        }

        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if(id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var like = await _datingRepository.GetLike(id, recipientId);

            if(like != null)
            {
                return BadRequest("You already like the user");
            }

            if(await _datingRepository.GetUser(recipientId) == null)
            {
                return NotFound();
            }

            like = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };

            _datingRepository.Add<Like>(like);

            if(await _datingRepository.SaveAll())
            {
                return Ok();
            }

            return BadRequest("Failed to like user.");
        }
    }
}