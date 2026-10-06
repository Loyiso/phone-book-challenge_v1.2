using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneBookAPI.Data;
using PhoneBookAPI.Models;

namespace PhoneBookAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/messages")]
public sealed class MessagesController(PhoneBookDbContext context) : ControllerBase
{
    /// <summary>Gets message history for the authenticated user, newest first.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<MessageHistoryItemResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<MessageHistoryItemResponse>>> GetMessages(
        CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var messages = await context.Messages
            .AsNoTracking()
            .Where(message => message.UserId == userId)
            .OrderByDescending(message => message.Date)
            .ThenByDescending(message => message.Id)
            .Select(message => new MessageHistoryItemResponse(
                message.Id,
                message.Type.ToString(),
                message.Body,
                message.Contact.Name + " " + message.Contact.Surname,
                message.Status.ToString(),
                message.Date))
            .ToListAsync(cancellationToken);

        return Ok(messages);
    }
}
