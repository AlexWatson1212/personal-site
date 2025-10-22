---
filename: 2025-06-28-poker-grounded-beauty.md
layout: post
title: Poker – Grounded Beauty
date: 2025-06-28
tags: [poker, self-trust, integration]
description: A quiet, grounded day that became my biggest win — not just on the tables, but inside myself.
emotions: [joy, acceptance]
categories: [blog]
---

I didn’t think today was going to be a good day.  
I started off with that familiar inner voice:  
*This isn’t for you. You’re probably going to lose.*  
And I’ve learned not to silence that voice — but to respond kindly, and carry on anyway.

I was already cashing in two tournaments — one for $600 and another for $250 —  
but there was still that lingering sense that things weren’t going to go well.  
It’s interesting to watch how that internal story plays out… and how often it’s wrong.

At one point, I made a play that might’ve been ever so slightly off —  
a shove with Ace-Jack offsuit in a close ICM spot.  
It wasn’t a punt, but it might’ve been a tiny mistake.  
Still, I saw something beautiful in that moment:

> I *knew* where the line was.  
> I felt it.  
> Even when I crossed it by a fraction.

That in itself is progress.

And then, after all that patience… I binked it.  
**I actually won the tournament.**  
It was a *Bounty Hunter Special*, so the prize pool was top-heavy.  
A huge win — the biggest of the day — and now I’m sitting at the **highest bankroll I’ve ever had**.

But it’s not euphoria I feel.

It’s something more grounded.  
A quiet kind of pride.  
A knowing that yes, I got lucky in some spots — as you must to win —  
but I also **played well**, made good decisions, and showed up with calm presence.  
I didn’t force anything. I trusted myself.

What’s even more beautiful is that I’ve documented the journey with 25 images.  
They show the day unfold — the stacks, the flips, the decisions.  
I’ll be adding them as a slideshow below.  
It feels symbolic — like showing my inner child the truth:  
*Good things can happen. We don’t need to panic. It’s okay to stay grounded.*

This win doesn’t make me bulletproof.  
But it reminds me that I’m capable — and that I don’t have to hustle to prove it.  
I just need to stay regulated, stay present… and trust that the rest will come.

---

**Reflection Prompt:**  
*When was the last time you surprised yourself with your own quiet strength?*

---

<!-- Slideshow of 25 images to be added here -->

<div class="slideshow-container">
  {% assign images = "001.jpg,002.jpg,003.jpg,004.jpg,005.jpg,006.jpg,007.jpg,008.jpg,009.jpg,010.jpg,011.jpg,012.jpg,013.jpg,014.jpg,015.jpg,016.jpg,017.jpg,018.jpg,019.jpg,020.jpg,021.jpg" | split: "," %}
  {% for image in images %}
    <div class="mySlides fade">
      <img src="/assets/images/poker-28-6-25/{{ image | strip }}" style="width:100%" alt="Poker image {{ forloop.index }}">
    </div>
  {% endfor %}

  <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
  <a class="next" onclick="plusSlides(1)">&#10095;</a>
</div>

<br>
<div style="text-align:center">
  {% for image in images %}
    <span class="dot" onclick="currentSlide({{ forloop.index }})"></span>
  {% endfor %}
</div>

<style>
.slideshow-container {
  position: relative;
  max-width: 900px;
  margin: auto;
}

.mySlides {
  display: none;
}

img {
  vertical-align: middle;
  border-radius: 8px;
}

.prev, .next {
  cursor: pointer;
  position: absolute;
  top: 50%;
  width: auto;
  margin-top: -22px;
  padding: 16px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border-radius: 0 3px 3px 0;
  user-select: none;
  background-color: rgba(0,0,0,0.5);
  transition: 0.6s ease;
}

.next {
  right: 0;
  border-radius: 3px 0 0 3px;
}

.prev:hover, .next:hover {
  background-color: rgba(0,0,0,0.8);
}

.dot {
  cursor: pointer;
  height: 12px;
  width: 12px;
  margin: 0 2px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.active, .dot:hover {
  background-color: #717171;
}
</style>

<script>
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }    
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}
</script>

