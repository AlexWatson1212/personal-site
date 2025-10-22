---
layout: default
permalink: /emotions/
---

# Explore by Emotion

This is a space for learning how to feel more freely — especially if you weren’t taught how.  
Each emotion below links to blog posts where that feeling is explored, reflected on, or simply held with care.

Use this page to find what you need.  
Sometimes naming it is the first step.

---

These ten core emotions were chosen not to represent everything we feel — but to offer a simple and meaningful starting point.  
Each one opens a door to deeper self-understanding without overwhelming you with complexity.

You may notice emotions like **pride**, **regret**, or **compassion** aren’t listed here.  
That’s intentional. These are often *blends* of the core ten — and may surface naturally as part of your reflection or healing.

In the future, I may expand the emotional map.  
But for now, these ten are enough.

---

<ul class="emotion-list">
  {% assign emotions = "grief,shame,fear,anger,loneliness,hope,love,joy,longing,acceptance" | split: "," %}
  {% for emotion in emotions %}
    <li>
      <h3><a href="/emotion/{{ emotion }}">{{ emotion | capitalize }}</a></h3>
      <p>
        {% case emotion %}
          {% when "grief" %} Loss and letting go
          {% when "shame" %} Feeling not good enough or fundamentally flawed
          {% when "fear" %} Anxiety, uncertainty, and overwhelm
          {% when "anger" %} Resentment, injustice, or crossed boundaries
          {% when "loneliness" %} Disconnection and isolation
          {% when "hope" %} Light, renewal, and the belief in change
          {% when "love" %} Warmth, connection, and safety
          {% when "joy" %} Peace, freedom, and celebration
          {% when "longing" %} Desire for what we’ve missed or needed
          {% when "acceptance" %} Integration, peace, and inner wholeness
        {% endcase %}
      </p>
    </li>
  {% endfor %}
</ul>
