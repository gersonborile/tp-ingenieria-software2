## ADDED Requirements

### Requirement: Precio de alquiler del equipamiento
El sistema SHALL incluir `pricePerUnit` (precio de alquiler por unidad, número decimal `>= 0`) en cada item del catálogo. El campo SHALL ser requerido en el alta (`POST /api/v1/equipamiento`), en la actualización (`PUT /api/v1/equipamiento/:id`) y SHALL estar presente en las respuestas del catálogo `GET /api/v1/equipamiento`.
