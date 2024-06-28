@php
    $plugin = \Saade\FilamentFullCalendar\FilamentFullCalendarPlugin::get();
@endphp

<x-filament-widgets::widget id="fullcalendar-widget">
    <x-filament::section>
        <div class="flex justify-end flex-1 mb-4">
            <x-filament-actions::actions :actions="$this->getCachedHeaderActions()" class="shrink-0" />
        </div>

        <div class="filament-fullcalendar" wire:ignore ax-load
            ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('filament-fullcalendar-alpine', 'saade/filament-fullcalendar') }}"
            ax-load-css="{{ \Filament\Support\Facades\FilamentAsset::getStyleHref('filament-fullcalendar-styles', 'saade/filament-fullcalendar') }}"
            x-ignore x-data="fullcalendar({
                locale: @js($plugin->getLocale()),
                plugins: @js($plugin->getPlugins()),
                schedulerLicenseKey: @js($plugin->getSchedulerLicenseKey()),
                timeZone: @js($plugin->getTimezone()),
                config: @js($this->getConfig()),
                editable: @json($plugin->isEditable()),
                selectable: @json($plugin->isSelectable()),
                eventClassNames: {!! htmlspecialchars($this->eventClassNames(), ENT_COMPAT) !!},
                eventContent: {!! htmlspecialchars($this->eventContent(), ENT_COMPAT) !!},
                eventDidMount: {!! htmlspecialchars($this->eventDidMount(), ENT_COMPAT) !!},
                eventWillUnmount: {!! htmlspecialchars($this->eventWillUnmount(), ENT_COMPAT) !!},
            })">
        </div>
    </x-filament::section>

    <x-filament-actions::modals />

    <x-filament::modal id="overlapping-activities-modal">
        <x-slot name="heading">
            {{ __('resources/activities.overlapping_activities') }}
        </x-slot>

        <x-slot name="description">
            {{ __('resources/activities.overlapping_activities_description') }}
        </x-slot>
        <x-slot name="footer">
            <x-filament::button wire:click="moveOverlappingActivities" class="w-full mb-2">
                {{ __('resources/activities.move_overlapping_activities') }}
            </x-filament::button>

            <x-filament::button color="gray" x-on:click="$dispatch('close-modal', { id: 'overlapping-activities-modal' })" class="w-full">
                {{ __('resources/activities.cancel') }}
            </x-filament::button>
        </x-slot>
    </x-filament::modal>
</x-filament-widgets::widget>
