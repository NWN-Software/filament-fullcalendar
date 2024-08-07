<?php

namespace Saade\FilamentFullCalendar\Traits;

use Filament\Actions\Action;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

trait PageHasContextMenu
{
    protected array $cachedContextMenuActions = [];

    protected static bool $contextMenuEnabled = true;

    public string|int|null $eventId = null;

    public ?Model $contextModel = null;

    public function bootedPageHasContextMenu(): void
    {
        $this->cacheContextMenuActions();
    }

    protected function cacheContextMenuActions(): void
    {
        foreach ($this->getContextMenuActions() as $action) {

            if (! $action instanceof Action) {
                throw new InvalidArgumentException('context menu action must be an instance of '.Action::class.'.');
            }

            $this->cachedContextMenuActions[] = $this->cacheAction($action);

        }
    }

    public function getCachedContextMenuActions(): array
    {
        return $this->cachedContextMenuActions;
    }

    public function getContextMenuActions(): array
    {
        return [];
    }

    public function isContextMenuEnabled(): bool
    {
        return static::$contextMenuEnabled
            && count($this->getContextMenuActions());
    }

    public function setContextMenuEvent(string|int|null $eventId): void
    {
        $this->eventId = $eventId;
        $this->contextModel = $eventId ? $this->resolveRecord($eventId) : null;
    }
}
