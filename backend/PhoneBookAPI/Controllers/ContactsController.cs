using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneBookAPI.Data;
using PhoneBookAPI.Data.Entities;
using PhoneBookAPI.Models;

namespace PhoneBookAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/contacts")]
public class ContactsController : ControllerBase
{
    private readonly ILogger<ContactsController> _logger;
    private readonly PhoneBookDbContext _context;

    public ContactsController(ILogger<ContactsController> logger, PhoneBookDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetContacts()
    {
        var userIdString = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdString != null)
        {
            var userId = Int32.Parse(userIdString);
            var contactResults = await _context.Contacts
                                               .Where(c => c.UserId == userId)
                                               .AsNoTracking()
                                               .Select(c => new ContactResultModel()
                                               {
                                                   Id = c.Id,
                                                   Name = c.Name,
                                                   Surname = c.Surname,
                                                   PhoneNumber = c.PhoneNumber,
                                                   Email = c.Email,
                                                   CreatedAt = c.CreatedAt,
                                                   UpdatedAt = c.UpdatedAt
                                               })
                                               .ToListAsync();

            return Ok(contactResults);
        }

        return NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateContact(NewContactModel newContactModel)
    {
        var userIdString = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdString != null)
        {
            var userId = Int32.Parse(userIdString);
            var newContact = new Contact()
            {
                Name = newContactModel.Name,
                Surname = newContactModel.Surname,
                PhoneNumber = newContactModel.PhoneNumber,
                Email = newContactModel.Email,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };
            
            _context.Add(newContact);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Contact successfully created" });
        }

        return Unauthorized();
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetContact(int id)
    {
        var userIdString = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (userIdString != null)
        {
            var userId = Int32.Parse(userIdString);
            var contact = await _context.Contacts
                                        .Where(c => c.UserId == userId && c.Id == id)
                                        .AsNoTracking()
                                        .Select(c => new ContactResultModel()
                                        {
                                            Id = c.Id,
                                            Name = c.Name,
                                            Surname = c.Surname,
                                            PhoneNumber = c.PhoneNumber,
                                            Email = c.Email,
                                            CreatedAt = c.CreatedAt,
                                            UpdatedAt = c.UpdatedAt
                                        })
                                        .FirstOrDefaultAsync();

            if(contact != null)
                return Ok(contact);
        }

        return NotFound();
    }
}