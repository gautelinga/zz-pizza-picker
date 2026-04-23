<script lang="ts">
  import type { Pizza, Filter } from '../types/pizza';

  let { pizzas }: { pizzas: Pizza[] } = $props();

  let activeFilter = $state<Filter>('all');
  let result = $state<Pizza | null>(null);
  let spinning = $state(false);

  let filteredPizzas = $derived.by(() => {
    if (activeFilter === 'veg') return pizzas.filter((p) => p.vegetarian);
    if (activeFilter === 'meat') return pizzas.filter((p) => !p.vegetarian);
    return pizzas;
  });

  // Reset result when filter changes, co-located with the state change (no $effect needed).
  function setFilter(f: Filter) {
    activeFilter = f;
    result = null;
  }

  function spin() {
    if (spinning) return;                       // guard re-entry (Pitfall 3)
    if (filteredPizzas.length === 0) return;    // FILT-03 safety
    spinning = true;
    result = null;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * filteredPizzas.length);
      result = filteredPizzas[idx];
      spinning = false;
    }, 1500);
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'veg', label: 'Veg' },
    { id: 'meat', label: 'Meat' },
  ];
</script>

<section class="w-full max-w-[400px] mx-auto px-4 py-8 flex flex-col gap-6">
  <div class="flex flex-col gap-1 items-center">
    <h1 class="text-2xl font-semibold leading-tight text-neutral-900 text-center">
      <a href="https://zz.pizza" target="_blank" rel="noopener noreferrer" class="hover:underline underline-offset-2">ZZ Pizza</a> Picker
    </h1>
    <p class="text-sm font-normal leading-snug text-neutral-500 text-center">One tap. One pizza. No regrets.</p>
  </div>

  <div class="flex gap-1 justify-center" role="group" aria-label="Filter pizzas by diet">
    {#each filters as f}
      <button
        type="button"
        class="px-4 py-2 min-h-[48px] rounded-full text-sm font-normal transition-colors border"
        class:bg-neutral-900={activeFilter === f.id}
        class:text-white={activeFilter === f.id}
        class:border-transparent={activeFilter === f.id}
        class:bg-neutral-100={activeFilter !== f.id}
        class:text-neutral-700={activeFilter !== f.id}
        class:border-neutral-200={activeFilter !== f.id}
        class:hover:bg-neutral-200={activeFilter !== f.id}
        aria-pressed={activeFilter === f.id}
        onclick={() => setFilter(f.id)}
      >
        {f.label}
      </button>
    {/each}
  </div>

  <p class="text-sm font-normal text-neutral-500 text-center">
    {filteredPizzas.length} pizzas available
  </p>

  <div class="flex flex-col items-center gap-2">
    <span class="text-5xl" class:spinning aria-hidden="true">🍕</span>
    <button
      type="button"
      class="px-6 py-3 min-h-[48px] rounded-full text-sm font-semibold transition-colors"
      class:bg-neutral-900={filteredPizzas.length > 0 && !spinning}
      class:text-white={filteredPizzas.length > 0 && !spinning}
      class:hover:bg-neutral-700={filteredPizzas.length > 0 && !spinning}
      class:opacity-75={spinning}
      class:bg-neutral-300={filteredPizzas.length === 0}
      class:text-neutral-400={filteredPizzas.length === 0}
      class:cursor-not-allowed={filteredPizzas.length === 0}
      disabled={filteredPizzas.length === 0 || spinning}
      aria-label={
        filteredPizzas.length === 0
          ? 'Spin disabled — no pizzas match this filter'
          : spinning
            ? 'Spinning, please wait'
            : result
              ? 'Spin again'
              : 'Spin'
      }
      onclick={spin}
    >
      {spinning ? 'Spinning…' : result ? 'Spin again' : 'Spin'}
    </button>
  </div>

  {#if result}
    <div
      role="status"
      aria-live="polite"
      class="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col gap-2 transition-opacity duration-200"
    >
      <span
        class="self-start text-sm font-normal px-2 py-1 rounded-full"
        class:bg-green-50={result.vegetarian}
        class:text-green-700={result.vegetarian}
        class:bg-orange-50={!result.vegetarian}
        class:text-orange-700={!result.vegetarian}
      >
        {result.vegetarian ? '🌱 Vegetarian' : '🥩 Meat'}
      </span>
      <h2 class="text-2xl font-semibold leading-tight text-neutral-900">
        {result.name}
      </h2>
      <p class="text-sm font-normal leading-relaxed text-neutral-500">
        {result.description}
      </p>
      <p class="text-sm font-normal text-neutral-700">
        {result.price_nok} kr
      </p>
    </div>
  {/if}

  {#if filteredPizzas.length === 0}
    <div class="text-center flex flex-col gap-1">
      <p class="text-sm font-semibold text-neutral-700">No pizzas match this filter</p>
      <p class="text-sm font-normal text-neutral-500">Switch to All or try a different filter.</p>
    </div>
  {/if}
</section>

<style>
  @keyframes spin-pizza {
    from { transform: rotate(0deg); }
    to   { transform: rotate(720deg); }
  }

  .spinning {
    display: inline-block;
    animation: spin-pizza 1.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  }
</style>
