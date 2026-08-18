--
-- PostgreSQL database dump
--

\restrict 6IynzaSD0XeJXg4EAXCDksV3b6vanKpejmCURookafV8aqyTo9B1QxbbhB90nCC

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-08-18 16:21:14

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16600)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16599)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 231 (class 1259 OID 16804)
-- Name: profile_social_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_social_links (
    id integer NOT NULL,
    user_id integer NOT NULL,
    platform character varying(50) NOT NULL,
    url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profile_social_links OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16803)
-- Name: profile_social_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_social_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_social_links_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 230
-- Name: profile_social_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_social_links_id_seq OWNED BY public.profile_social_links.id;


--
-- TOC entry 229 (class 1259 OID 16786)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    bio text,
    phone character varying(30) NOT NULL,
    email character varying(255),
    profile_picture bytea,
    profile_picture_mime_type character varying(50),
    location character varying(255),
    website character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16765)
-- Name: service_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_images (
    id integer NOT NULL,
    service_id integer NOT NULL,
    image_data bytea NOT NULL,
    mime_type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.service_images OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16764)
-- Name: service_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_images_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 227
-- Name: service_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_images_id_seq OWNED BY public.service_images.id;


--
-- TOC entry 226 (class 1259 OID 16663)
-- Name: service_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_requests (
    id integer NOT NULL,
    service_id integer NOT NULL,
    requester_id integer NOT NULL,
    message text NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT service_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.service_requests OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16662)
-- Name: service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 225
-- Name: service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_requests_id_seq OWNED BY public.service_requests.id;


--
-- TOC entry 224 (class 1259 OID 16615)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    price numeric(10,2),
    location character varying(150),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16614)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 220 (class 1259 OID 16542)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    password_hash text,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16541)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4889 (class 2604 OID 16603)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 16807)
-- Name: profile_social_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_social_links ALTER COLUMN id SET DEFAULT nextval('public.profile_social_links_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 16768)
-- Name: service_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_images ALTER COLUMN id SET DEFAULT nextval('public.service_images_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16666)
-- Name: service_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests ALTER COLUMN id SET DEFAULT nextval('public.service_requests_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 16618)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 16545)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4909 (class 2606 OID 16613)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4911 (class 2606 OID 16611)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 16816)
-- Name: profile_social_links profile_social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_social_links
    ADD CONSTRAINT profile_social_links_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 16797)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4923 (class 2606 OID 16777)
-- Name: service_images service_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT service_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 16681)
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 16631)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 16557)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 1259 OID 16697)
-- Name: idx_requests_requester_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_requester_id ON public.service_requests USING btree (requester_id);


--
-- TOC entry 4918 (class 1259 OID 16696)
-- Name: idx_requests_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_service_id ON public.service_requests USING btree (service_id);


--
-- TOC entry 4919 (class 1259 OID 16698)
-- Name: idx_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_status ON public.service_requests USING btree (status);


--
-- TOC entry 4912 (class 1259 OID 16693)
-- Name: idx_services_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_category_id ON public.services USING btree (category_id);


--
-- TOC entry 4913 (class 1259 OID 16694)
-- Name: idx_services_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_location ON public.services USING btree (location);


--
-- TOC entry 4914 (class 1259 OID 16692)
-- Name: idx_services_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_user_id ON public.services USING btree (user_id);


--
-- TOC entry 4934 (class 2606 OID 16817)
-- Name: profile_social_links profile_social_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_social_links
    ADD CONSTRAINT profile_social_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 16798)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4932 (class 2606 OID 16778)
-- Name: service_images service_images_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT service_images_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 4930 (class 2606 OID 16687)
-- Name: service_requests service_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4931 (class 2606 OID 16682)
-- Name: service_requests service_requests_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 4928 (class 2606 OID 16637)
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- TOC entry 4929 (class 2606 OID 16632)
-- Name: services services_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-08-18 16:21:15

--
-- PostgreSQL database dump complete
--

\unrestrict 6IynzaSD0XeJXg4EAXCDksV3b6vanKpejmCURookafV8aqyTo9B1QxbbhB90nCC

