<?php

namespace Saade\FilamentFullCalendar\Widgets;

use Filament\Actions\Action;
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Widgets\Widget;
use Saade\FilamentFullCalendar\Actions;
use Saade\FilamentFullCalendar\Traits\PageHasContextMenu;

class FullCalendarWidget extends Widget implements HasActions, HasForms
{
    use Concerns\CanBeConfigured;
    use Concerns\InteractsWithEvents;
    use Concerns\InteractsWithHeaderActions;
    use Concerns\InteractsWithModalActions;
    use Concerns\InteractsWithRawJS;
    use Concerns\InteractsWithRecords;
    use InteractsWithActions;
    use InteractsWithForms;
    use PageHasContextMenu;

    protected static string $view = 'filament-fullcalendar::fullcalendar';

    protected int|string|array $columnSpan = 'full';

    protected function headerActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }

    protected function modalActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function viewAction(): Action
    {
        return Actions\ViewAction::make();
    }

    /**
     * FullCalendar will call this function whenever it needs new event data.
     * This is triggered when the user clicks prev/next or switches views.
     *
     * @param  array{start: string, end: string, timezone: string}  $info
     */
    public function fetchEvents(array $info): array
    {
        return [];
    }

    public function getFormSchema(): array
    {
        return [];
    }

    public function onEventResize(array $event, array $oldEvent, array $relatedEvents, array $startDelta, array $endDelta): bool
    {
        return false;
    }
}
