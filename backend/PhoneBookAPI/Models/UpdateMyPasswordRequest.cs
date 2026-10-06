using System.ComponentModel.DataAnnotations;

namespace PhoneBookAPI.Models;

/// <summary>Credentials and confirmation required to change the authenticated user's password.</summary>
public sealed record UpdateMyPasswordRequest
{
    /// <summary>The user's current password.</summary>
    [Required]
    public required string CurrentPassword { get; init; }

    /// <summary>The new password to set.</summary>
    [Required]
    public required string NewPassword { get; init; }

    /// <summary>Confirmation of the new password.</summary>
    [Required]
    public required string ConfirmNewPassword { get; init; }
}
