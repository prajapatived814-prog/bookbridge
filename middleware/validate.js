/**
 * ==========================================================================
 * ZOD INPUT VALIDATION MIDDLEWARE
 * ==========================================================================
 */

let zod = null;
try { zod = require('zod'); } catch (e) { zod = null; }

exports.validateBookInput = (req, res, next) => {
  if (!zod) return next();

  try {
    const bookSchema = zod.object({
      title: zod.string().min(2),
      author: zod.string().min(2),
      semester: zod.number().int().min(1).max(6).optional(),
      branch: zod.string().optional(),
      mode: zod.enum(['exchange', 'sell', 'buy', 'donate']).optional()
    });

    bookSchema.partial().parse({
      ...req.body,
      semester: req.body.semester ? parseInt(req.body.semester) : 5
    });

    next();
  } catch (error) {
    return res.status(400).json({ error: 'Validation failed', details: error.errors || error.message });
  }
};
