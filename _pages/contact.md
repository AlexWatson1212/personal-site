---
layout: default
permalink: /contact/
---

<style>
  .contact-container {
    max-width: 600px;
    margin: 3rem auto;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .contact-container h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .contact-container p {
    font-size: 1rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #444;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .contact-form label {
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  .contact-form input,
  .contact-form textarea {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    padding: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    transition: border-color 0.2s;
  }

  .contact-form input:focus,
  .contact-form textarea:focus {
    border-color: #b6753a;
    outline: none;
  }

  .contact-form button {
    background-color: #1A2D41;
    color: white;
    font-size: 1rem;
    padding: 0.9rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .contact-form button:hover {
    background-color: #2d4158;
  }

  @media (max-width: 600px) {
    .contact-container {
      margin: 2rem 1rem;
      padding: 1.5rem;
    }
  }
</style>

<section class="contact-container">
  <h1>Contact</h1>
  <p>If something here resonates, if you have a question, or if you'd simply like to connect — you’re welcome to reach out using the form below.</p>

  <form action="https://formspree.io/f/xpwybnnb" method="POST" class="contact-form">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required />

    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />

    <label for="message">Message</label>
    <textarea id="message" name="message" rows="6" required></textarea>

    <button type="submit">Send Message</button>
  </form>
</section>
