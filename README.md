# Franquicias Magno — Sitio web

Sitio corporativo premium de franquicias gastronómicas (HTML5 + CSS3 + JavaScript Vanilla).

## Cómo ver el sitio

Abre `index.html` en el navegador, o sirve la carpeta con un servidor local:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Luego visita `http://localhost:8080`.

## Estructura

```
/
├── index.html
├── aviso-de-privacidad.html
├── franquicias/          # 8 páginas de marca
├── css/                  # style, components, brands, responsive
├── js/                   # config, franchises, navigation, animations, forms, main
└── assets/               # images, logos, icons
```

## Añadir una 9ª franquicia

1. Agrega un objeto en `js/franchises.js` (`window.MagnoFranchises`).
2. Crea carpeta `assets/images/franchises/{slug}/`.
3. Copia una página de `franquicias/` y cambia `data-brand`, textos SEO y `data-selected` del select.
4. El mega-menú, cards del home y selects se actualizan solos desde `franchises.js`.

## Conectar el formulario (backend)

En `js/config.js`:

```js
forms: {
  endpoint: "/api/prospect.php", // o URL de API / CRM
  method: "POST",
}
```

El payload JSON incluye: `name`, `email`, `phone`, `franchiseId`, `franchiseName`, `message`, `privacyAccepted`, `source`, `page`, `submittedAt`.

## WhatsApp

Configurado con `+52 1 961 154 2067`. El mensaje se prellena:

`Hola, quiero información sobre la franquicia [NOMBRE].`

## Datos reales pendientes ([EDITABLE])

- Fotografías hero, galería y por marca
- Logos oficiales de cada franquicia
- Montos de inversión, regalías, ROI (no inventados)
- URLs reales de Facebook e Instagram
- Texto legal definitivo del aviso de privacidad
- Detalle operativo / COF por marca
