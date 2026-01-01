using Microsoft.AspNetCore.Mvc;
using PhoneBookAPI.Data;
using PhoneBookAPI.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PhoneBookAPI.Models;

namespace PhoneBookAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly PhoneBookDbContext _context;

    public AuthController(ILogger<AuthController> logger, PhoneBookDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginModel loginModel)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == loginModel.Email && u.Password == loginModel.Password);

        if (user == null)
        {
            return Unauthorized("Invalid email or password");
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(1)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties);

        return Ok(new { user= new {user.Name, user.Surname, user.Email}, message = "Successfully logged in" });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(SignUpModel signUpModel)
    {
        // Check if a user already exists
        if (await _context.Users.AnyAsync(u => u.Email == signUpModel.Email))
        {
            return BadRequest("User with this email already exists");
        }

        var newUser = new User()
        {
            Email = signUpModel.Email,
            Name = signUpModel.Name,
            Surname = signUpModel.Surname,
            Password = signUpModel.Password,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.Add(newUser);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "User successfully registered" });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Successfully logged out" });
    }
}