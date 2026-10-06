using System.ComponentModel.DataAnnotations;

namespace PhoneBookAPI.Models;

/// <summary>Profile details to update for the authenticated user.</summary>
public sealed record UpdateMyProfileRequest
{
    /// <summary>The user's given name.</summary>
    [Required]
    public required string Name { get; init; }

    /// <summary>The user's surname.</summary>
    [Required]
    public required string Surname { get; init; }

    /// <summary>The user's email address.</summary>
    [Required, EmailAddress]
    public required string Email { get; init; }
}
