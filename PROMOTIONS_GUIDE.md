# Promotions Management Guide

## Overview
The Garden Guru store now includes a comprehensive promotions system that allows you to showcase special offers, seasonal sales, and exclusive deals. All promotions are managed through a simple JSON file.

## Features
✅ **Hero Section** - Beautiful landing page with stats and call-to-actions
✅ **Categories Display** - Visual category navigation on homepage
✅ **Promotions System** - JSON-based promotion management
✅ **Individual Promotion Pages** - Detailed pages for each promotion
✅ **Modern UI** - Raleway font, smooth animations, professional design
✅ **Mobile Responsive** - Perfect on all devices
✅ **Fast Loading** - CDN fonts, optimized images

## Managing Promotions

### Location
All promotions are managed in: `/store/data/promotions.json`

### Promotion Structure
```json
{
  "id": "unique-promotion-id",
  "title": "Promotion Title",
  "subtitle": "Short tagline",
  "description": "Detailed description of the promotion",
  "image": "https://image-url.com/image.jpg",
  "badge": "Limited Time | New | Hot Deal",
  "discount": "30",
  "startDate": "2026-05-01",
  "endDate": "2026-05-31",
  "active": true,
  "link": "/promotions/unique-promotion-id"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (used in URL) |
| `title` | string | Yes | Main promotion title |
| `subtitle` | string | Yes | Short tagline or category |
| `description` | string | Yes | Full description of the offer |
| `image` | string | Yes | URL to promotion image (Unsplash or uploaded) |
| `badge` | string | Yes | Badge text (e.g., "Limited Time", "New") |
| `discount` | string | No | Discount percentage (without % symbol) |
| `startDate` | string | Yes | Start date (YYYY-MM-DD format) |
| `endDate` | string | Yes | End date (YYYY-MM-DD format) |
| `active` | boolean | Yes | Whether promotion is currently active |
| `link` | string | Yes | URL path (must match: /promotions/{id}) |

## Adding a New Promotion

1. Open `/store/data/promotions.json`
2. Add a new promotion object to the `promotions` array:

```json
{
  "id": "summer-sale-2026",
  "title": "Summer Sale",
  "subtitle": "Beat the Heat",
  "description": "Cool down with our refreshing summer collection. Fresh blooms perfect for the season!",
  "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
  "badge": "Hot Deal",
  "discount": "25",
  "startDate": "2026-06-01",
  "endDate": "2026-08-31",
  "active": true,
  "link": "/promotions/summer-sale-2026"
}
```

3. Save the file
4. The promotion will automatically appear on:
   - Homepage (if active)
   - `/promotions` page
   - `/promotions/summer-sale-2026` (individual page)

## Deactivating a Promotion

Simply change `"active": true` to `"active": false`:

```json
{
  "id": "old-promotion",
  "active": false,
  ...
}
```

## Image Recommendations

### Using Unsplash (Free)
1. Go to [Unsplash.com](https://unsplash.com)
2. Search for flower/plant images
3. Copy the image URL with parameters: `?w=800&q=80`
4. Example: `https://images.unsplash.com/photo-1234567890?w=800&q=80`

### Image Specifications
- **Recommended Size**: 800x600px or larger
- **Format**: JPG or WebP
- **Aspect Ratio**: 4:3 or 16:9
- **Quality**: High resolution for best display

### Uploading Custom Images
1. Place images in `/store/public/images/promotions/`
2. Reference as: `"/images/promotions/your-image.jpg"`

## Pages Structure

### Homepage (`/`)
- Hero section with main CTA
- Categories grid (6 categories)
- Active promotions (top 3)
- Featured products
- Why Choose Us section

### Promotions Page (`/promotions`)
- All active promotions in grid layout
- Newsletter subscription CTA
- Filters and sorting (future enhancement)

### Individual Promotion (`/promotions/[slug]`)
- Full promotion details
- Discount badge and validity dates
- Featured products
- Terms & conditions
- Back to promotions link

## Customization

### Colors
The store uses the primary green color `#00b050`. To change:
1. Update `tailwind.config.ts`
2. Modify the `primary` color value

### Fonts
- **Main Font**: Raleway (via Google Fonts CDN)
- **Accent Font**: Comic Neue (for playful elements)

To change fonts, edit `/store/app/layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

### Hero Image
To change the homepage hero image, edit `/store/app/page.tsx`:
```tsx
<img 
  src="YOUR_NEW_IMAGE_URL" 
  alt="Beautiful flower arrangement"
  className="w-full h-[500px] object-cover"
/>
```

## Best Practices

### Promotion Naming
- Use lowercase with hyphens: `spring-sale-2026`
- Be descriptive: `mothers-day-special`
- Include year if seasonal: `christmas-2026`

### Badge Text
Keep it short and impactful:
- ✅ "Limited Time"
- ✅ "New"
- ✅ "Hot Deal"
- ✅ "Exclusive"
- ❌ "This is a limited time offer only"

### Descriptions
- Keep under 200 characters
- Focus on benefits
- Include call-to-action language
- Be specific about the offer

### Dates
- Always use YYYY-MM-DD format
- Set realistic end dates
- Update or deactivate expired promotions regularly

## Troubleshooting

### Promotion Not Showing
1. Check `"active": true` is set
2. Verify dates are current
3. Ensure `id` matches the URL slug
4. Check JSON syntax is valid

### Image Not Loading
1. Verify image URL is accessible
2. Check for HTTPS (not HTTP)
3. Ensure no CORS issues
4. Try a different image source

### Build Errors
1. Validate JSON syntax at [JSONLint](https://jsonlint.com)
2. Check all required fields are present
3. Ensure no trailing commas in JSON
4. Verify date format is correct

## Future Enhancements

Potential features to add:
- [ ] Admin dashboard for promotion management
- [ ] Automatic promotion activation/deactivation by date
- [ ] Promotion analytics and tracking
- [ ] Coupon code integration
- [ ] Email notifications for new promotions
- [ ] Social media sharing buttons
- [ ] Promotion categories/tags

## Support

For questions or issues:
1. Check this guide first
2. Review the JSON file structure
3. Test in development before deploying
4. Contact the development team

---

**Last Updated**: May 27, 2026
**Version**: 1.0.0
