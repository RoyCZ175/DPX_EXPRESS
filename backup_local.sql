--
-- PostgreSQL database dump
--

\restrict RtbCmWeN4dfvvHfmoGKjQtSCYviFfESlURaPz5UGstmHntGFjJOPwWuHDO9xncc

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, nombre, email, password, rol, activo, created_at) FROM stdin;
2	Roger Caiza	rogercaiza02@gmail.com	$2b$10$s3gqrdnS0qdV7/Uh8TMavO51XNX0ZJMW5llqAzwDVmCo1FNHgrOXO	superadmin	t	2026-06-21 22:31:33.537855
1	Administrador	admin@dpx.com	$2b$10$Dct.uYo8X/8/i/NCuh/ywOy3bfeUfsbnTJE5HZlWzIHz0O84pqRKe	admin	t	2026-06-21 22:09:43.978961
\.


--
-- Data for Name: bocaditos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bocaditos (id, nombre, imagen) FROM stdin;
1	Bocaditos de sal	images/bocaditos.jpg
2	Bocaditos de dulce	images/bocaditos.jpg
3	Bocaditos de carne	images/bocaditos.jpg
\.


--
-- Data for Name: galleteria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.galleteria (id, nombre, imagen) FROM stdin;
1	Bizcochos	images/panaderia.png
2	Quesadillas	images/panaderia.png
3	Moncaibas	images/panaderia.png
4	Galletas	images/panaderia.png
5	Hojaldres	images/panaderia.png
\.


--
-- Data for Name: otros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otros (id, nombre, imagen, descripcion) FROM stdin;
1	Eventos	images/horneado.jpg	Servicio completo de panadería y pastelería para eventos sociales y corporativos
\.


--
-- Data for Name: panaderia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.panaderia (id, nombre, imagen) FROM stdin;
4	Rosquillas	images/panaderia.png
1	Pan de sal	images/productos/pan-de-sal-1782098394437.png
2	Pan de dulce	images/productos/pan-de-dulce-1782098415480.png
3	Pan integral	images/productos/pan-integral-1782098423536.png
\.


--
-- Data for Name: pasteleria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pasteleria (id, nombre, imagen) FROM stdin;
1	Postres	images/pasteleria.jpg
2	Eventos	images/productos/eventos-1782098913168.png
3	Personalizados	images/productos/personalizados-1782098920392.png
\.


--
-- Data for Name: servicio_horno; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.servicio_horno (id, nombre, imagen, descripcion) FROM stdin;
1	Pavos	images/horneado.jpg	Horneado completo de pavo para eventos y celebraciones
2	Pollos	images/horneado.jpg	Pollos al horno con sazón artesanal
3	Chuletas	images/horneado.jpg	Chuletas de cerdo horneadas a la perfección
4	Chanchos	images/horneado.jpg	Chancho horneado entero para eventos grandes
5	Cuyes	images/horneado.jpg	Cuyes horneados al estilo tradicional serrano
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 2, true);


--
-- Name: bocaditos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bocaditos_id_seq', 3, true);


--
-- Name: galleteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.galleteria_id_seq', 5, true);


--
-- Name: otros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.otros_id_seq', 1, true);


--
-- Name: panaderia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.panaderia_id_seq', 4, true);


--
-- Name: pasteleria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pasteleria_id_seq', 3, true);


--
-- Name: servicio_horno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.servicio_horno_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

\unrestrict RtbCmWeN4dfvvHfmoGKjQtSCYviFfESlURaPz5UGstmHntGFjJOPwWuHDO9xncc

