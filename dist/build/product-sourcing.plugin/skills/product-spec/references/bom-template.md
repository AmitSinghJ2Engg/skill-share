# BOM Template — Component Categories

Standard Bill of Materials structure for Ismokraft wooden products. Every ProductSpec BOM must use these categories.

## Component Categories

| Category | Description | Typical Components |
|---|---|---|
| **Primary Material** | Main structural wood | Wood planks, blocks, turned pieces |
| **Secondary Material** | Non-wood structural | Metal frame, acrylic panel, fabric lining |
| **Hardware** | Functional metal parts | Hinges, magnets, clasps, screws, drawer slides |
| **Surface Treatment** | Finish materials | Lacquer, polish, paint, oil, stain |
| **Adhesive** | Bonding agents | Wood glue, epoxy, contact cement |
| **Packaging — Inner** | Product protection | Bubble wrap, foam insert, tissue paper |
| **Packaging — Outer** | Shipping box | Corrugated box, mailer, sleeve |
| **Packaging — Insert** | Presentation | Velvet pouch, branded card, care instruction card |
| **Labeling** | Regulatory + brand | MRP sticker, barcode label, brand tag, care label |
| **Personalization** | Custom elements | Engraving, name plate, custom paint |

## Cost Estimation Rules

1. **Wood cost:** Calculate from volume (L × W × H × quantity of pieces) converted to cubic feet. Multiply by per-cft rate from wood species database.
2. **Hardware cost:** Use per-unit rates. Common rates (Jodhpur cluster, 2026):
   - Small brass hinge (25mm): ₹8–15/piece
   - Neodymium magnet (10mm): ₹5–10/piece
   - Brass clasp: ₹20–35/piece
   - Wood screw (25mm): ₹1–2/piece
3. **Surface treatment:** Estimate ₹15–40/item depending on type and coats.
4. **Packaging:** Standard box ₹25–60 depending on size tier. Insert adds ₹10–30.
5. **Labor:** Not itemized in BOM — included in vendor per-unit quote. But estimate ₹50–150/unit for complexity sizing.
## BOM Validation Rules

- Total BOM must not exceed target_cogs_max_inr (from LaunchBrief or user).
- Primary material should be 40–60% of total BOM for wood-dominant products.
- Packaging should not exceed 15% of total BOM.
- If BOM > target by > 10%: flag COGS_RISK.
- If BOM < 50% of target: likely missing components — review completeness.