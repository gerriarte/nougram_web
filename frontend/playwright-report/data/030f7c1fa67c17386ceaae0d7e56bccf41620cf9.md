# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - heading "Bienvenido a Nougram" [level=1] [ref=e8]
      - paragraph [ref=e9]: Inicia sesión para gestionar las cotizaciones de tu agencia creativa
    - generic [ref=e10]:
      - generic [ref=e11]:
        - text: Correo Electrónico
        - textbox "Correo Electrónico" [ref=e12]:
          - /placeholder: tu@ejemplo.com
      - generic [ref=e13]:
        - text: Contraseña
        - generic [ref=e14]:
          - textbox "Contraseña" [ref=e15]:
            - /placeholder: Ingresa tu contraseña
          - button "Mostrar contraseña" [ref=e16] [cursor=pointer]:
            - img [ref=e17]
      - button "Iniciar Sesión" [ref=e20] [cursor=pointer]
      - generic [ref=e21]:
        - text: ¿No tienes una cuenta?
        - link "Regístrate" [ref=e22] [cursor=pointer]:
          - /url: /register
  - region "Notifications (F8)":
    - list
  - alert [ref=e23]
```