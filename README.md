# Café do Virgulino · Landing page

Site estático. Não precisa de build nem de dependências: abra `index.html` ou sirva a pasta com qualquer servidor.

```
index.html
css/      tokens, base, components, header, hero, sections
js/       main (menu e header), reveal (entrada + parallax), hero-scrub (vídeo no scroll)
assets/
  fonts/  Bricolage Grotesque e Hanken Grotesk (auto-hospedadas)
  frames/ 145 quadros do vídeo do hero (f000.webp a f144.webp)
  img/    estampa, favicon e imagens extraídas do vídeo
```

Para testar localmente: `python3 -m http.server 8000` dentro da pasta.

O hero troca o vídeo por uma sequência de quadros desenhada num canvas, ligada ao scroll. Para trocar o vídeo:
`ffmpeg -i novo.mp4 -vf scale=1280:-2 -c:v libwebp -quality 62 -start_number 0 assets/frames/f%03d.webp`
e ajuste `TOTAL` em `js/hero-scrub.js`.
