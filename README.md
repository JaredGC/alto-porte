En este README.md encontrarán toda la documentación del proyecto, desde la idea inicial hasta el despliegue.
--No habrá ningún de texto generado por IA en este archivo--


Parece ser que Alto Porte quiere que realice un pequeño CRM como prueba técnica, debo ingeniármelas para no rehacer exactamente el mismo CRM que hice para Acres Inmobiliaria.

Me pidieron que trabaje con Angular + Express + MongoDB, pero mi stack actual es Next + Nest + PostgreSQL.

Ellos no se lo esperan, pero voy a entregarles el CRM hecho en ambos stack, la idea es presentar mi stack principal como la muestra de mis habilidades como desarrollador, y presentar el otro stack como la muestra de mis habilidades de aprendizaje.

(edit) pues al haber hecho casi todo a mano, parece que ya no me ha dado el tiempo para hacer eso, son las 1am y recién he terminado el backend y la base del frontend, voy a suspender esa idea.

La idea de mover los leads por cilindros que representan los estados es de las mejores ideas que he visto, pero debe haber alguna otra idea...
Estuve buscando otra manera de manejar los leads, pero no encontré ninguna mejor que la de los cilindros, me quedaré con esa idea.



Los requerimientos ya están detallados en el documento,
por lo que voy a comenzar por planificar la estructura de la base de datos, sus tablas y relaciones:

			--DB ENTITIES (cada uno tendrá su created_at y updated_at)---

-Core:
	-roles: 
		-ID					PRIMARY KEY, INTEGER, NOT NULL
		-name:						     VARCHAR, NOT NULL
			-Super admin
			-Admin
			-Agente 
		-slug						     VARCHAR, NOT NULL
			0-super_admin
			1-admin
			2-agent
	
	-users:
		-ID					PRIMARY KEY, INTEGER, NOT NULL
		-name						     VARCHAR, NOT NULL
		-email						     VARCHAR, NOT NULL
		-password					     TEXT,    NOT NULL
		-access_token					     TEXT,    NOT NULL
		-role_id				FOREIGN KEY, INTEGER, NOT NULL
	
-Deals:
	-leads:
		-ID					PRIMARY KEY, INTEGER, NOT NULL
		-name						     VARCHAR, NOT NULL
		-email						     VARCHAR, NULLABLE
		-phone						     VARCHAR, NOT NULL
		-source						     VARCHAR, NOT NULL
		-status:					     INTEGER, NOT NULL
			1-Nuevo
			2-Contactado
			3-Calificado
			4-Reservado
			5-Descartado
		-budget						     FLOAT,   NOT NULL
		-project					     VARCHAR, NOT NULL
		-agent_id				FOREIGN KEY, INTEGER, NOT NULL

-Dashboard:
	-dashboard (más adelante explicaré por qué esta tabla es importante):
		-ID					PRIMARY KEY, INTEGER, NOT NULL
		-json						     TEXT,    NOT NULL
		-syncronized					     BOOLEAN, NOT NULL


Creo que esa estructura bastará.


Ahora, para el backend en Nest, voy a utilizar mi estructura favorita (hecha a mano):

nest-backend:
	/src
	   /Config
		-cors-origins.ts
	   /Tests
	   /Modules
		/Core | estructura de módulos:
		    /Controllers
		    /Servicies
		    /Entities
		    /Modules
		    /Guard
			-token.guard.ts
			-token-guard.decorator.ts
		/User
		/Deals
		/Dashboard
	   -app.controller.ts
	   -app.module.ts
	   -app.service.ts
	   -main.ts
	-.env
	-.env.example

Para el frontend, dado que usaré NextJs, el enrutamiento ya está definido, por lo que usaré esta estructura:

next-frontend:
	/app
		/(logged out)
			/login
				-actions.ts
				-loginForm.tsx
				-page.tsx
		/lib
			-api.ts
			-server-api.ts
			-session.ts
		-layout.tsx
		-page.tsx
		/tratos
			-page.tsx
			-layout.tsx
		/dashboard
			-page.tsx
			-layout.tsx


Normalmente solo copiaría y pegaría todo esto escrito a Claude Code, pero llevo tanto tiempo de no escribir código a mano que prefiero hacerlo yo mismo
Comencé creando un nuevo repositorio llamado technical-test-alto-porte con git init
Dentro del repositorio creé las carpetas y archivos tal como lo indicaba el documento.


He comenzado por crear el backend, voy a utilizar el patrón de diseño MVC que aprendí en laravel

He terminado el backend en nest, pero me he dado cuenta que en el documento decía que los datos para el dashboard no deberían ser calculados en memoria, si no desde MongoDB, eso era algo que no tomé en cuenta, pues mi idea principal era cargarlos solo una vez y almacenar el json hasta que algún dato cambiara, porque sé que un dashboard puede ser pesado. voy a realizarlo de esa manera en el backend en Express

Quería terminar el frontend hoy, pero apenas he podido terminar una tarea que me dejó la empresa a esta hora


Vamos a comenzar la pantalla de tratos utilizando la librería @hello-pangea/dnd que es para manejar una lista draggable.
El frontend traerá los leads del backend.
Voy a utilizar la librería @hello-pangea/dnd para hacer los cilindros con items desplazables
He terminado la tabla de leads, aunque me falta refactorizar el código, continuaré mañana.