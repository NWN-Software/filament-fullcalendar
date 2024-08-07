@if ($this->isContextMenuEnabled())
    <div id="contextMenu" wire:ignore.self
        class="flex z-50 min-w-48 max-w-2xl text-neutral-800 rounded-md ring-1 ring-gray-950/5 transition bg-white text-sm fixed p-2 shadow-md dark:text-gray-200 dark:bg-gray-900 dark:ring-white/10"
        style="display: none ">
        @foreach (static::getCachedContextMenuActions() as $action)
            @if ($action->isVisible())
                @if ($action instanceof \Filament\Actions\Action)
                    <div @class([
                        'context-menu-filament-action flex gap-x-4 select-none group rounded hover:bg-neutral-100 justify-between outline-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none dark:hover:bg-white/5',
                        'mt-1' => !$loop->first,
                    ])>
                        {{ $action }}

                    </div>
                @endif
            @endif
        @endforeach
    </div>
@endif
