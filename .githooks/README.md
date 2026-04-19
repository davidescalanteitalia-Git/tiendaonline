# .githooks/

Hooks Git versionables para TIENDAONLINE. No usan dependencias externas
(no Husky), solo Bash y `git config core.hooksPath`.

## Instalación (una vez por clon)

```bash
npm run hooks:install
```

Equivale a:

```bash
git config core.hooksPath .githooks
```

Esto indica a Git que use `.githooks/` en lugar del `.git/hooks/` por defecto.
La configuración es **local a cada clon** y no se versiona — por eso cada dev
nuevo tiene que correr `npm run hooks:install` una vez.

## Hooks incluidos

### `pre-commit`

Corre `npm run lint:i18n:ci` cuando hay cambios staged en archivos `.js/.jsx/.ts/.tsx`.
Bloquea el commit si detecta:

- Falta de paridad entre idiomas (IT/ES/EN)
- Contaminación de idioma dentro de un string
- Frases marketeras prohibidas (revisar `BANNED_PHRASES` en `lib/validate-i18n.js`)

Si por alguna razón necesitas saltarte el hook (emergencia, WIP):

```bash
git commit --no-verify
```

## Verificar que funciona

```bash
# Forzar ejecución manual
bash .githooks/pre-commit
```

Debe imprimir `✅ Pre-commit: diccionario limpio.` y salir con código 0.
