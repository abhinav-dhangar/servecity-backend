# ✨ **Supabase Auth Backend**

<img src="./server/files/okarun.png" width="640"/>

Designed with the logic of nicroserices architecture in mind and the reliability of a seasoned developer.

---

## 🌟 **What This Project Is**

This is a ** supabase auth backend** with:

- 🔑 **Supabase Auth** (Google/GitHub login ready)
- 🧰 **Clean folder structure**
- 🐳 **Docker Support** for dev + prod
- ⚙️ **Fast setup**, no overthinking like a slice-of-life MC
- 🔐 **Environment variables required** (All defined in `.env.example`)

> ⚠️ To run this backend _100% correctly_, you **must** create a `.env` file based on `.env.example`. Missing values will break your jutsu. 🌀

---

## ⚙️ **Super-Quick Setup!**

<img src="./server/files/image.gif" width="360"/>

### 1️⃣ Go to the repo folder using `cd`

### 2️⃣ Remove old git config (If fetched from template)

```bash
npx rimraf ./.git
```

---

## 🐳 **Run Using Docker**

Your backend will power up like a Saiyan with these commands.

### 🧪 Development Mode

```bash
npm i
docker-compose -f docker-compose.dev.yaml up --build
```

📝 We run `npm i` first because dev mode uses bind mounts. Without installing dependencies **inside your machine**, you may get errors like:

```
Error: Cannot find module 'express'
```

### ⚔️ Production Mode

```bash
docker compose -f docker-compose.prod.yaml up --build
```

This builds an optimized container—like an S-Class mage on a mission.

---

## 🖥️ **Run Without Docker (Native)**

Prefer raw power? Go native.

### ⏿ Go inside folder

```
cd server
```

### 🧪 Development

```bash
npm i
npm run dev
```

### ⚔️ Production

```bash
npm i
npm run start
```

---

## 🔐 **Environment Variables Required**

Like chakra—your backend won’t work without it.

Create a `.env` file based on:

```
.env.example
```

Missing even one key → your login magic will fail. ❌🪄

---

## ✨ Extra Notes

- This backend is ideal for **fast production**, hackathons, quick projects, portfolio templates.
- Supports **auth**, **refresh tokens**, **middleware**, and **clean modular controllers**.
- Works great with **React / Next.js / Flutter / mobile apps**.

---

## 🎉 Thanks For Reading!

<img src="./server/files/ok.gif" width="330"/>

🚀
