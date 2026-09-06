using FloreriaApi.Models;
using System.Security.Cryptography;
using System.Text;

namespace FloreriaApi.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Seed / Update Admin User
            var adminUser = context.AdminUsers.FirstOrDefault(u => u.Username == "admin");
            var adminPasswordHash = HashPassword("AdminDemo2026");

            if (adminUser == null)
            {
                context.AdminUsers.Add(new AdminUser
                {
                    Username = "admin",
                    PasswordHash = adminPasswordHash,
                    Role = "Admin"
                });
                context.SaveChanges();
            }
            else if (adminUser.PasswordHash != adminPasswordHash)
            {
                adminUser.PasswordHash = adminPasswordHash;
                context.SaveChanges();
            }

            // Seed Site Settings
            if (!context.SiteSettings.Any())
            {
                context.SiteSettings.Add(new SiteSettings
                {
                    BusinessPhone = "+573206468689",
                    WhatsAppNumber = "573206468689",
                    BusinessEmail = "pedidos@florerialacarreta.com",
                    Address = "Cra 49 # 131 Sur-69",
                    City = "Caldas, Antioquia, Colombia",
                    InstagramUrl = "https://www.instagram.com/floristeria_la_carreta",
                    FacebookUrl = "",
                    ScheduleWeekdays = "Lunes a Sábado: 8:00 AM - 6:00 PM",
                    ScheduleWeekends = "Domingos y Festivos: Cerrado",
                    GoogleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0583547070116!2d-75.6378!3d6.0911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e468307db4ef757%3A0x6b1c4e78a6ea23f0!2sCra.%2049%20%23131%20Sur-69%2C%20Caldas%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1709000000000!5m2!1ses!2sco",
                    DeliveryNotes = "Entregas en Caldas, La Estrella, Sabaneta, Itagüí y Envigado.",
                    UpdatedAt = DateTime.UtcNow
                });
                context.SaveChanges();
            }

            // Seed Categories
            if (!context.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new Category { Slug = "todos", NameEs = "Todos", NameEn = "All", Icon = "🌸", SortOrder = 0, IsActive = true },
                    new Category { Slug = "ramos", NameEs = "Ramos Florales", NameEn = "Flower Bouquets", Icon = "💐", SortOrder = 1, IsActive = true },
                    new Category { Slug = "arreglos", NameEs = "Centros y Arreglos", NameEn = "Arrangements", Icon = "🏺", SortOrder = 2, IsActive = true },
                    new Category { Slug = "plantas", NameEs = "Plantas Vivas", NameEn = "Live Plants", Icon = "🌿", SortOrder = 3, IsActive = true },
                    new Category { Slug = "premium", NameEs = "Especiales y Cajas", NameEn = "Premium & Boxes", Icon = "✨", SortOrder = 4, IsActive = true },
                    new Category { Slug = "condolencias", NameEs = "Condolencias", NameEn = "Sympathy", Icon = "🕊️", SortOrder = 5, IsActive = true }
                };
                context.Categories.AddRange(categories);
                context.SaveChanges();
            }

            // Seed Products
            if (!context.Products.Any())
            {
                var seedProducts = new List<Product>
                {
                    new Product
                    {
                        NameEs = "Ramo de Rosas Rojas Clásicas",
                        NameEn = "Classic Red Roses Bouquet",
                        DescriptionEs = "Hermoso ramo artesanal compuesto por 24 rosas rojas seleccionadas y eucalipto fresco.",
                        DescriptionEn = "Beautiful handcrafted bouquet of 24 premium red roses with fresh eucalyptus.",
                        Price = 145000,
                        Category = "ramos",
                        Image = "/images/roses-bouquet.jpg",
                        Featured = true,
                        IsActive = true,
                        OccasionEs = "[\"Amor\", \"Aniversario\", \"Cumpleaños\"]",
                        OccasionEn = "[\"Love\", \"Anniversary\", \"Birthday\"]"
                    },
                    new Product
                    {
                        NameEs = "Centro de Mesa Romántico",
                        NameEn = "Romantic Table Centerpiece",
                        DescriptionEs = "Elegante arreglo en cerámica blanca con peonías rosa, ranúnculos y follaje verde.",
                        DescriptionEn = "Elegant arrangement in white ceramic with pink peonies, ranunculus, and greens.",
                        Price = 185000,
                        Category = "arreglos",
                        Image = "/images/centerpiece-pink.jpg",
                        Featured = true,
                        IsActive = true,
                        OccasionEs = "[\"Bodas\", \"Aniversario\", \"Cenas\"]",
                        OccasionEn = "[\"Weddings\", \"Anniversary\", \"Dinners\"]"
                    },
                    new Product
                    {
                        NameEs = "Arreglo Tropical Exótico",
                        NameEn = "Exotic Tropical Arrangement",
                        DescriptionEs = "Diseño exuberante con aves del paraíso, orquídeas y follaje de monstera en jarrón de lujo.",
                        DescriptionEn = "Lush design with birds of paradise, orchids, and monstera leaves in a luxury vase.",
                        Price = 260000,
                        Category = "arreglos",
                        Image = "/images/tropical-arrangement.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Felicitaciones\", \"Inauguración\"]",
                        OccasionEn = "[\"Congratulations\", \"Grand Opening\"]"
                    },
                    new Product
                    {
                        NameEs = "Ramo Sol de Girasoles",
                        NameEn = "Sunshine Sunflower Bouquet",
                        DescriptionEs = "Alegre ramillete de girasoles brillantes amarrado con yute e hilos rústicos.",
                        DescriptionEn = "Cheerful bundle of bright sunflowers wrapped in rustic jute and twine.",
                        Price = 95000,
                        Category = "ramos",
                        Image = "/images/sunflower-bouquet.jpg",
                        Featured = true,
                        IsActive = true,
                        OccasionEs = "[\"Cumpleaños\", \"Mejorate Pronto\"]",
                        OccasionEn = "[\"Birthday\", \"Get Well Soon\"]"
                    },
                    new Product
                    {
                        NameEs = "Orquídea Blanca Phalaenopsis",
                        NameEn = "White Phalaenopsis Orchid",
                        DescriptionEs = "Planta de orquídea blanca de dos varas en maceta minimalista de cerámica.",
                        DescriptionEn = "Two-stem white orchid plant in a minimalist ceramic pot.",
                        Price = 210000,
                        Category = "plantas",
                        Image = "/images/white-orchids.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Agradecimiento\", \"Decoración\"]",
                        OccasionEn = "[\"Gratitude\", \"Home Decor\"]"
                    },
                    new Product
                    {
                        NameEs = "Corona de Condolencias Furia Blanca",
                        NameEn = "White Serenity Funeral Wreath",
                        DescriptionEs = "Solemne y elegante corona funeraria con lirios blancos, crisantemos y finos follajes.",
                        DescriptionEn = "Solemn and elegant funeral wreath with white lilies, chrysanthemums, and fine greens.",
                        Price = 310000,
                        Category = "condolencias",
                        Image = "/images/condolence-wreath.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Condolencias\", \"Exequias\"]",
                        OccasionEn = "[\"Sympathy\", \"Funeral\"]"
                    },
                    new Product
                    {
                        NameEs = "Ramo Silvestre Artesanal",
                        NameEn = "Artisan Wildflower Bouquet",
                        DescriptionEs = "Mezcla campestre de lavanda, margaritas y flores silvestre envueltas en papel kraft.",
                        DescriptionEn = "Rustic blend of lavender, daisies, and wildflowers wrapped in craft paper.",
                        Price = 115000,
                        Category = "ramos",
                        Image = "/images/mixed-wildflowers.jpg",
                        Featured = true,
                        IsActive = true,
                        OccasionEs = "[\"Amistad\", \"Detalle\"]",
                        OccasionEn = "[\"Friendship\", \"Just Because\"]"
                    },
                    new Product
                    {
                        NameEs = "Caja Corazón Rosas & Chocolates",
                        NameEn = "Heart Box Roses & Chocolates",
                        DescriptionEs = "Caja premium en forma de corazón con rosas seleccionadas y finos chocolates.",
                        DescriptionEn = "Premium heart-shaped box filled with selected roses and fine chocolates.",
                        Price = 280000,
                        Category = "premium",
                        Image = "/images/romantic-box.jpg",
                        Featured = true,
                        IsActive = true,
                        OccasionEs = "[\"San Valentín\", \"Aniversario\", \"Romántico\"]",
                        OccasionEn = "[\"Valentine's\", \"Anniversary\", \"Romantic\"]"
                    },
                    new Product
                    {
                        NameEs = "Arreglo Primavera Peonías & Rosas",
                        NameEn = "Spring Peony & Rose Arrangement",
                        DescriptionEs = "Delicado arreglo en tonos pastel en florero artesanal ideal para centro de mesa.",
                        DescriptionEn = "Delicate pastel arrangement in handcrafted vase ideal for table centerpiece.",
                        Price = 175000,
                        Category = "arreglos",
                        Image = "/images/centerpiece-pink.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Día de las Madres\", \"Cumpleaños\"]",
                        OccasionEn = "[\"Mother's Day\", \"Birthday\"]"
                    },
                    new Product
                    {
                        NameEs = "Bouquet Silvestre del Valle",
                        NameEn = "Valley Wildflower Bouquet",
                        DescriptionEs = "Inspirado en los campos antioqueños, una selección de flores frescas de alta montaña.",
                        DescriptionEn = "Inspired by Antioquian fields, a selection of fresh mountain flowers.",
                        Price = 125000,
                        Category = "ramos",
                        Image = "/images/mixed-wildflowers.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Agradecimiento\", \"Amor\"]",
                        OccasionEn = "[\"Gratitude\", \"Love\"]"
                    },
                    new Product
                    {
                        NameEs = "Jardín Tropical Antioqueño",
                        NameEn = "Antioquian Tropical Garden",
                        DescriptionEs = "Arreglo monumental de flores exóticas colombianas con diseño vanguardista.",
                        DescriptionEn = "Monumental arrangement of exotic Colombian flowers with modern design.",
                        Price = 340000,
                        Category = "premium",
                        Image = "/images/tropical-arrangement.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Corporativo\", \"Eventos\"]",
                        OccasionEn = "[\"Corporate\", \"Events\"]"
                    },
                    new Product
                    {
                        NameEs = "Ramo Alegría Amarilla",
                        NameEn = "Yellow Joy Sunflower Bouquet",
                        DescriptionEs = "Ramo vibrante de girasoles y flores amarillas para llenar de luz cualquier día.",
                        DescriptionEn = "Vibrant bouquet of sunflowers and yellow flowers to brighten any day.",
                        Price = 105000,
                        Category = "ramos",
                        Image = "/images/sunflower-bouquet.jpg",
                        Featured = false,
                        IsActive = true,
                        OccasionEs = "[\"Cumpleaños\", \"Grados\"]",
                        OccasionEn = "[\"Birthday\", \"Graduation\"]"
                    }
                };

                context.Products.AddRange(seedProducts);
                context.SaveChanges();
            }
        }

        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
