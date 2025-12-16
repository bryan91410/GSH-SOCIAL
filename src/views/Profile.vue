<template>
  <div class="g-window">
    <div class="g-bar">
      <span class="g-title">PROFILE_PANEL</span>
      <div class="flex gap-1"><span class="g-dot"></span><span class="g-dot"></span><span class="g-dot"></span></div>
    </div>

    <div class="p-4 grid gap-4 md:grid-cols-2">
      <div class="g-field">
        <input class="g-input" placeholder=" " />
        <label class="g-label" data-text="NAME">NAME</label>
      </div>
      <div class="g-field">
        <input class="g-input" placeholder=" " />
        <label class="g-label" data-text="EMAIL">EMAIL</label>
      </div>
      <div class="g-field md:col-span-2">
        <input class="g-input" placeholder=" " />
        <label class="g-label" data-text="ROLE">ROLE</label>
      </div>
      <div class="md:col-span-2">
        <button class="g-btn" data-text="SAVE"><span class="g-btn-text">SAVE</span></button>
      </div>
    </div>
  </div>
</template>
