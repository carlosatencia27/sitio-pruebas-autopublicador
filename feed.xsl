<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title><xsl:value-of select="rss/channel/title"/> · Novedades</title>
<style>
body{margin:0;background:#f4f6ff;color:#1c2340;font:18px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:16px}
.hero{background:linear-gradient(135deg,#1b4dff,#6a3df0 55%,#e8420c);color:#fff;border-radius:18px;padding:22px 18px;margin-bottom:18px}
.hero h1{margin:0 0 6px;font-size:1.7rem}
.hero p{margin:0 0 6px}
.note{background:#fff8e0;border-left:6px solid #ff9f1a;border-radius:12px;padding:10px 14px;margin:0 0 18px}
.item{display:block;background:#fff;border-radius:16px;box-shadow:0 6px 18px rgba(28,35,64,.1);padding:14px 16px;margin:0 0 14px;text-decoration:none;color:#1c2340}
.item strong{display:block;font-size:1.1rem;color:#1b4dff}
.item span{color:#5a6285;font-size:.95rem}
.btn{display:inline-block;background:#fff;color:#1b4dff;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:99px;min-height:44px}
</style>
</head>
<body>
<div class="wrap">
<div class="hero">
<h1>🔔 <xsl:value-of select="rss/channel/title"/></h1>
<p>Esta es la lista de artículos nuevos. Si usas un lector RSS, copia el enlace de esta página en él.</p>
<a class="btn"><xsl:attribute name="href"><xsl:value-of select="rss/channel/link"/></xsl:attribute>Ir al sitio</a>
</div>
<p class="note">¿Eres un niño o una niña? Es más fácil instalar el sitio como app: pídele ayuda a un adulto y busca el botón «Avisarme» en el sitio.</p>
<xsl:for-each select="rss/channel/item">
<a class="item"><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
<strong><xsl:value-of select="title"/></strong>
<span><xsl:value-of select="description"/></span></a>
</xsl:for-each>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
