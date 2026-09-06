using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FloreriaApi.Data;
using FloreriaApi.Models;

namespace FloreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products (Public - only active products)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] string? category = null)
        {
            var query = _context.Products.Where(p => p.IsActive);

            if (!string.IsNullOrWhiteSpace(category) && category.ToLower() != "todos")
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            return await query.OrderByDescending(p => p.Id).ToListAsync();
        }

        // GET: api/products/featured (Public)
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<Product>>> GetFeaturedProducts()
        {
            return await _context.Products
                .Where(p => p.IsActive && p.Featured)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        // GET: api/products/admin (Admin - all products including inactive)
        [Authorize]
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<Product>>> GetAllProductsAdmin()
        {
            return await _context.Products
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        // GET: api/products/5 (Public)
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // POST: api/products (Admin)
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct([FromBody] Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/products/5 (Admin)
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Products.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(product);
        }

        // PATCH: api/products/5/toggle-active (Admin)
        [Authorize]
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.IsActive = !product.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { id = product.Id, isActive = product.IsActive });
        }

        // DELETE: api/products/5 (Admin)
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
