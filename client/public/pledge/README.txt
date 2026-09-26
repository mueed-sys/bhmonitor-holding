poster-base.jpg is the web-sized loyalty poster (1242x2225, ~0.558 ratio),
downscaled from the supplied 3072x5504 original. The participant's name is
composited client-side into the blank slot between "...والتقدير إلى" and
"لمشاركتكم...".

Name slot is configured by the NAME_* constants at the top of
client/src/pages/pledge.tsx:
  NAME_BASELINE_Y = 0.78   (vertical centre of the slot)
  NAME_CENTER_X   = 0.5
  NAME_MAX_WIDTH  = 0.80
  NAME_COLOR      = #9E1B32 (deep Bahrain red; set "#0A0A0A" to match body ink)
If the artwork is re-exported at a different size, keep poster-base.jpg and
update POSTER_W / POSTER_H to its pixel dimensions.
