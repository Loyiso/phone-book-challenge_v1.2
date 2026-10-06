namespace PhoneBookAPI.Models;

/// <summary>A message record in the authenticated user's history.</summary>
public sealed record MessageHistoryItemResponse(
    int Id,
    string Type,
    string Body,
    string ContactName,
    string Status,
    DateTime Date);