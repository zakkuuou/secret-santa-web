using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Настройки для работы статических файлов (index.html)
app.UseDefaultFiles();
app.UseStaticFiles();

// Хранилище данных (сбросится при перезапуске сервера)
var participants = new List<string>();
var assignments = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
var wishes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
var syncRoot = new object();

// 1. Регистрация и получение Тайного друга
app.MapPost("/api/santa/register", ([FromBody] RegisterRequest req) =>
{
    if (string.IsNullOrWhiteSpace(req.Name)) 
        return Results.BadRequest(new { error = "Имя пустое" });

    var name = req.Name.Trim();
    string? giftFor = null;

    lock (syncRoot)
    {
        if (!participants.Contains(name, StringComparer.OrdinalIgnoreCase))
        {
            participants.Add(name);
            // Если участников >= 2, перемешиваем всех заново для честности
            if (participants.Count > 1)
            {
                var rnd = new Random();
                var shuffled = participants.OrderBy(x => rnd.Next()).ToList();
                assignments.Clear();
                for (int i = 0; i < shuffled.Count; i++)
                {
                    assignments[shuffled[i]] = shuffled[(i + 1) % shuffled.Count];
                }
            }
        }
        assignments.TryGetValue(name, out giftFor);
    }
    return Results.Ok(new { userName = name, giftFor });
});

// 2. Сохранение пожелания
app.MapPost("/api/santa/wish", ([FromBody] WishRequest req) =>
{
    lock (syncRoot)
    {
        if (!participants.Contains(req.Name, StringComparer.OrdinalIgnoreCase))
            return Results.NotFound(new { error = "Сначала зарегистрируйтесь" });
        
        wishes[req.Name.Trim()] = req.Wish.Trim();
        return Results.Ok(new { status = "wish saved" });
    }
});

// 3. Получение пожелания конкретного человека
app.MapGet("/api/santa/wish/{name}", (string name) =>
{
    lock (syncRoot)
    {
        wishes.TryGetValue(name.Trim(), out var wish);
        return Results.Ok(new { name, wish = wish ?? "Пока ничего не заказал :(" });
    }
});

app.Run();

public record RegisterRequest(string Name);
public record WishRequest(string Name, string Wish);