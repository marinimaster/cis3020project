--
-- PostgreSQL database dump
--

\restrict zSvblmHx84UtT5b6tQyq6ECBCFJP9jhwDQ2PG15xnTiUge8xFiWI3fTHs3CzAh9

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: poly_database_p21f_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO poly_database_p21f_user;

--
-- Name: add_balance(numeric, numeric); Type: FUNCTION; Schema: public; Owner: poly_database_p21f_user
--

CREATE FUNCTION public.add_balance(base_balance numeric, balance_to_add numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
declare
    final_amount numeric;
begin
    final_amount := base_balance + balance_to_add;

    return round(final_amount, 2);

end;
$$;


ALTER FUNCTION public.add_balance(base_balance numeric, balance_to_add numeric) OWNER TO poly_database_p21f_user;

--
-- Name: add_balance_to_user(numeric, numeric); Type: FUNCTION; Schema: public; Owner: poly_database_p21f_user
--

CREATE FUNCTION public.add_balance_to_user(user_id numeric, extra_balance numeric) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    dynamic_query TEXT;
begin
    dynamic_query := format(
            'update wallets set balance = add_balance(balance, %L) where id = %L',
                     extra_balance,
                     user_id
            );

    execute dynamic_query;
end;
$$;


ALTER FUNCTION public.add_balance_to_user(user_id numeric, extra_balance numeric) OWNER TO poly_database_p21f_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: poly_database_p21f_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(30) NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(30) DEFAULT 'standard'::character varying NOT NULL,
    CONSTRAINT password_notempty CHECK ((password <> ''::text)),
    CONSTRAINT username_notempty CHECK (((username)::text <> ''::text))
);


ALTER TABLE public.users OWNER TO poly_database_p21f_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: poly_database_p21f_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO poly_database_p21f_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: poly_database_p21f_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: poly_database_p21f_user
--

CREATE TABLE public.wallets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    currency character varying(5) DEFAULT '$'::character varying,
    balance integer DEFAULT random(500, 2000) NOT NULL
);


ALTER TABLE public.wallets OWNER TO poly_database_p21f_user;

--
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: public; Owner: poly_database_p21f_user
--

CREATE SEQUENCE public.wallets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallets_id_seq OWNER TO poly_database_p21f_user;

--
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: poly_database_p21f_user
--

ALTER SEQUENCE public.wallets_id_seq OWNED BY public.wallets.id;


--
-- Name: wallets_user_id_seq; Type: SEQUENCE; Schema: public; Owner: poly_database_p21f_user
--

CREATE SEQUENCE public.wallets_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallets_user_id_seq OWNER TO poly_database_p21f_user;

--
-- Name: wallets_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: poly_database_p21f_user
--

ALTER SEQUENCE public.wallets_user_id_seq OWNED BY public.wallets.user_id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wallets id; Type: DEFAULT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.wallets ALTER COLUMN id SET DEFAULT nextval('public.wallets_id_seq'::regclass);


--
-- Name: wallets user_id; Type: DEFAULT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.wallets ALTER COLUMN user_id SET DEFAULT nextval('public.wallets_user_id_seq'::regclass);


--
-- Name: wallets user_id_unique; Type: CONSTRAINT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT user_id_unique UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: poly_database_p21f_user
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO poly_database_p21f_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO poly_database_p21f_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO poly_database_p21f_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO poly_database_p21f_user;


--
-- PostgreSQL database dump complete
--

\unrestrict zSvblmHx84UtT5b6tQyq6ECBCFJP9jhwDQ2PG15xnTiUge8xFiWI3fTHs3CzAh9

