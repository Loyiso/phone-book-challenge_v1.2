using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneBookAPI.Data;

namespace PhoneBookAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly PhoneBookDbContext _context;

    public UserController(ILogger<UserController> logger, PhoneBookDbContext context)
    {
        _logger = logger;
        _context = context;
    }
    
    [HttpGet("me")]
    public async Task<IActionResult> Get()
    {
        var userIdString = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdString != null)
        {
            var userId = Int32.Parse(userIdString);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if(user != null)
                return Ok(new { user.Name, user.Surname, user.Email });
        }

        return Unauthorized();
    }
    
    [HttpPost("me/profile")]
    public async Task<IActionResult> UpdateMyProfile(string name, string surname, string email)
    {
        var userIdString = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdString != null)
        {
            var userId = Int32.Parse(userIdString);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if(user != null)
            {
                var emailAlreadyInUse = await _context.Users.AnyAsync(u => u.Email == email && u.Id != userId);
                if(emailAlreadyInUse)
                    return BadRequest("Email already in use");
                
                user.Name = name;
                user.Surname = surname;
                user.Email = email;
                
                _context.Update(user);
                await _context.SaveChangesAsync();
                
                return Ok(new { user.Name, user.Surname, user.Email });
            }
        }

        return Unauthorized();
    }
    
    [HttpPost("me/password")]
    public async Task<IActionResult> UpdateMyPassword(string currentPassword, string newPassword, string confirmNewPassword)
    {
        var userIdString = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdString != null)
        {
            if(newPassword != confirmNewPassword)
                return BadRequest("Passwords do not match");
            
            var userId = Int32.Parse(userIdString);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if(user != null)
            {
                if (user.Password == currentPassword)
                {
                    user.Password = newPassword;
                    
                    _context.Update(user);
                    await _context.SaveChangesAsync();

                    return Ok(new { user.Name, user.Surname, user.Email });
                }
            }
        }

        return Unauthorized();
    }
}