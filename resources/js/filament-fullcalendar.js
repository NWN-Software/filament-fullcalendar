import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import timelinePlugin from "@fullcalendar/timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import resourcePlugin from "@fullcalendar/resource";
import resourceDayGridPlugin from "@fullcalendar/resource-daygrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import rrulePlugin from "@fullcalendar/rrule";
import momentPlugin from "@fullcalendar/moment";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import locales from "@fullcalendar/core/locales-all";

export default function fullcalendar({
    locale,
    plugins,
    schedulerLicenseKey,
    timeZone,
    config,
    editable,
    selectable,
    eventClassNames,
    eventContent,
    eventDidMount,
    eventWillUnmount,
}) {
    return {
        init() {
            /** @type Calendar */
            const calendar = new Calendar(this.$el, {
                headerToolbar: {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek,dayGridDay",
                },
                plugins: plugins.map((plugin) => availablePlugins[plugin]),
                locale,
                schedulerLicenseKey,
                timeZone,
                editable,
                selectable,
                ...config,
                locales,
                eventClassNames,
                eventContent: function (arg) {
                    let title = document.createElement(
                        arg.event.extendedProps.titleElement || "p",
                    );
                    title.innerHTML = arg.event.title;
                    let arrayOfDomNodes = [title];

                    const extraLines =
                        arg.event.extendedProps?.extraLines || null;

                    if (extraLines && typeof extraLines === "object") {
                        extraLines.forEach((line) => {
                            const element = document.createElement(
                                line.type || "p",
                            );
                            element.innerHTML = line.content;
                            arrayOfDomNodes.push(element);
                        });
                    }

                    return { domNodes: arrayOfDomNodes };
                },
                eventDidMount,
                eventWillUnmount,
                events: (info, successCallback, failureCallback) => {
                    this.$wire
                        .fetchEvents({
                            start: info.startStr,
                            end: info.endStr,
                            timezone: info.timeZone,
                        })
                        .then(successCallback)
                        .catch(failureCallback);
                },
                eventClick: ({ event, jsEvent }) => {
                    jsEvent.preventDefault();

                    if (event.url) {
                        const isNotPlainLeftClick = (e) =>
                            e.which > 1 ||
                            e.altKey ||
                            e.ctrlKey ||
                            e.metaKey ||
                            e.shiftKey;
                        return window.open(
                            event.url,
                            event.extendedProps.shouldOpenUrlInNewTab ||
                                isNotPlainLeftClick(jsEvent)
                                ? "_blank"
                                : "_self",
                        );
                    }

                    this.$wire.onEventClick(event);
                },
                eventDrop: async ({
                    event,
                    oldEvent,
                    relatedEvents,
                    delta,
                    oldResource,
                    newResource,
                    revert,
                }) => {
                    const shouldRevert = await this.$wire.onEventDrop(
                        event,
                        oldEvent,
                        relatedEvents,
                        delta,
                        oldResource,
                        newResource,
                    );

                    if (typeof shouldRevert === "boolean" && shouldRevert) {
                        revert();
                    }
                },
                eventResize: async ({
                    event,
                    oldEvent,
                    relatedEvents,
                    startDelta,
                    endDelta,
                    revert,
                }) => {
                    const shouldRevert = await this.$wire.onEventResize(
                        event,
                        oldEvent,
                        relatedEvents,
                        startDelta,
                        endDelta,
                    );

                    if (typeof shouldRevert === "boolean" && shouldRevert) {
                        revert();
                    }
                },
                dateClick: ({ dateStr, allDay, view, resource }) => {
                    if (!selectable) return;
                    this.$wire.onDateSelect(
                        dateStr,
                        null,
                        allDay,
                        view,
                        resource,
                    );
                },
                select: ({ startStr, endStr, allDay, view, resource }) => {
                    if (!selectable) return;
                    this.$wire.onDateSelect(
                        startStr,
                        endStr,
                        allDay,
                        view,
                        resource,
                    );
                },
            });

            calendar.render();

            window.addEventListener("filament-fullcalendar--refresh", () =>
                calendar.refetchEvents(),
            );

            window.addEventListener("filament-fullcalendar--addEvent", (e) => {
                const eventData = e.__livewire.params.shift();
                console.log("eventdata", eventData);
                if (eventData) {
                    calendar.addResource(eventData, true);
                }
            });

            window.addEventListener(
                "filament-fullcalendar--deleteResource",
                (e) => {
                    const resourceId = e.__livewire.params.shift().toString();
                    const resource = calendar.getResourceById(resourceId);

                    if (resource) {
                        resource.remove();
                    }
                },
            );

            window.addEventListener(
                "filament-fullcalendar--updateResourceParent",
                (e) => {
                    const data = e.__livewire.params.shift();
                    const resource = calendar.getResourceById(data.resourceId);
                    if (resource) {
                        resource.setProp("parentId", data.parentId);

                        if (data.title !== resource.title) {
                            resource.setProp('title', data.title);
                        }
                    }
                },
            );

            window.addEventListener(
                "filament-fullcalendar--updateEventTitle",
                (e) => {
                    const data = e.__livewire.params.shift();
                    const event = calendar.getEventById( data.eventId );

                    if (event && data.title !== event.title) {
                        event.setProp('title', data.title);
                    }
                },
            );

            window.addEventListener(
                "filament-fullcalendar--updateEventResource",
                (e) => {
                    const data = e.__livewire.params.shift();
                    const event = calendar.getEventById(data.eventId);

                    if (event) {
                        event.setExtendedProp("resourceId", data.resourceId);
                        calendar.refetchEvents();
                    }
                },
            );
        },
    };
}

const availablePlugins = {
    interaction: interactionPlugin,
    dayGrid: dayGridPlugin,
    timeGrid: timeGridPlugin,
    list: listPlugin,
    multiMonth: multiMonthPlugin,
    scrollGrid: scrollGridPlugin,
    timeline: timelinePlugin,
    adaptive: adaptivePlugin,
    resource: resourcePlugin,
    resourceDayGrid: resourceDayGridPlugin,
    resourceTimeline: resourceTimelinePlugin,
    resourceTimeGrid: resourceTimeGridPlugin,
    rrule: rrulePlugin,
    moment: momentPlugin,
    momentTimezone: momentTimezonePlugin,
};
