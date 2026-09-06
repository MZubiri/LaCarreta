using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FloreriaApi.Data;
using FloreriaApi.Models;

namespace FloreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
        }

        // GET: api/categories/all (Admin)
        [Authorize]
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
        {
            return await _context.Categories
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
        }

        // POST: api/categories
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Slug))
            {
                category.Slug = category.NameEs.ToLower().Trim().Replace(" ", "-");
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        // PUT: api/categories/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // DELETE: api/categories/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
