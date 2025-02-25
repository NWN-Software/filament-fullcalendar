import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import scrollGridPlugin from '@fullcalendar/scrollgrid'
import timelinePlugin from '@fullcalendar/timeline'
import adaptivePlugin from '@fullcalendar/adaptive'
import resourcePlugin from '@fullcalendar/resource'
import resourceDayGridPlugin from '@fullcalendar/resource-daygrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import rrulePlugin from '@fullcalendar/rrule'
import momentPlugin from '@fullcalendar/moment'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import locales from '@fullcalendar/core/locales-all'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

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
            const contextMenu = document.getElementById('contextMenu');

            /** @type Calendar */
            const calendar = new Calendar(this.$el, {
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek,dayGridDay',
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
                        arg.event.extendedProps.titleElement || 'p',
                    )
                    title.innerHTML = arg.event.title
                    let arrayOfDomNodes = [title]

                    const extraLines =
                        arg.event.extendedProps?.extraLines || null

                    if (extraLines && typeof extraLines === 'object') {
                        extraLines.forEach((line) => {
                            const element = document.createElement(
                                line.type || 'p',
                            )
                            element.innerHTML = line.content
                            arrayOfDomNodes.push(element)
                        })
                    }

                    const expandableLines = arg.event.extendedProps?.expandableLines || null;
                    if (expandableLines) {
                        expandableLines.forEach((line) => {
                            const element = document.createElement(
                                line.type || 'p',
                            )
                            element.classList.add('expandable-line');
                            element.style.display = 'none';
                            element.innerHTML = line.content
                            arrayOfDomNodes.push(element)
                        })

                        const toggle = document.createElement('button');
                        toggle.innerHTML = '<svg fill="#000000" height="12px" width="12px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"></path> </g></svg>';
                        toggle.style.position = 'absolute';
                        toggle.style.top = '2px';
                        toggle.style.zIndex = '1000';
                        toggle.style.right = '2px';
                        toggle.setAttribute('collapsed', '0');

                        toggle.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const line = e.target.parentElement.parentElement.querySelector('.expandable-line');
                            const collapsed = e.target.parentElement.getAttribute('collapsed');
                            line.style.display = collapsed === '0' ? 'block' : 'none';
                                    
                            e.target.parentElement.setAttribute('collapsed', collapsed === '0' ? '1' : '0');
                            calendar.updateSize();
                        };

                        arrayOfDomNodes.push(toggle);
                    }

                    return { domNodes: arrayOfDomNodes }
                },
                eventDidMount: (arg) => {

                    if (!arg.isDragging && (!contextMenu || arg.event.display === "background" || arg.event._def.resourceEditable === false)) return;

                    const eventId = arg.event.id;

                    arg.el.addEventListener("contextmenu", (jsEvent)=>{
                        jsEvent.preventDefault()

                        this.$wire.setContextMenuEvent(eventId);

                        contextMenu.style.display = 'block'; // Show the context menu
                        contextMenu.style.opacity = '0';

                        let closeChildrenContextMenu = new Event('close-children-context-menu');
                        dispatchEvent(closeChildrenContextMenu);
                        
                        setTimeout(function () {
                            calculateContextMenuPosition(jsEvent);
                            contextMenu.style.opacity = '1';
                        }, 0); // Similar to $nextTick
                    })
                },
                eventWillUnmount,
                events: (info, successCallback, failureCallback) => {
                    this.$wire
                        .fetchEvents({
                            start: info.startStr,
                            end: info.endStr,
                            timezone: info.timeZone,
                        })
                        .then(successCallback)
                        .catch(failureCallback)
                },
                eventClick: ({ event, jsEvent }) => {
                    jsEvent.preventDefault()

                    if (event.url) {
                        const isNotPlainLeftClick = (e) =>
                            e.which > 1 ||
                            e.altKey ||
                            e.ctrlKey ||
                            e.metaKey ||
                            e.shiftKey
                        return window.open(
                            event.url,
                            event.extendedProps.shouldOpenUrlInNewTab ||
                                isNotPlainLeftClick(jsEvent)
                                ? '_blank'
                                : '_self',
                        )
                    }

                    this.$wire.onEventClick(event)
                },
                eventReceive: async ({
                    event,
                    revert,
                }) => {
                    const shouldRevert = await this.$wire.onEventReceive(
                        event,
                        event.getResources(),
                    )

                    if (typeof shouldRevert === 'boolean' && shouldRevert) {
                        revert()
                    }
                },
                eventDrop: async ({
                    event,
                    jsEvent,
                    oldEvent,
                    relatedEvents,
                    delta,
                    oldResource,
                    newResource,
                    revert,
                }) => {
                    const copyEvent = jsEvent.ctrlKey || jsEvent.metaKey || jsEvent.altKey;

                    if (copyEvent) {
                        revert();

                        const shouldRevert = await this.$wire.onEventCopy(
                            event,
                            oldEvent,
                            relatedEvents,
                            delta,
                            oldResource,
                            newResource
                        )

                        return;
                    }

                    if (jsEvent.shiftKey) { 
                        revert()
                        oldEvent.setResources([...oldEvent.getResources(), ...event.getResources()])
                        oldEvent.setDates(event.start, event.end);
                    }

                    const shouldRevert = await this.$wire.onEventDrop(
                        event,
                        oldEvent,
                        relatedEvents,
                        delta,
                        oldResource,
                        newResource,
                        jsEvent.shiftKey,
                    )

                    if (typeof shouldRevert === 'boolean' && shouldRevert) {
                        revert()
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
                    )

                    if (typeof shouldRevert === 'boolean' && shouldRevert) {
                        revert()
                    }
                },
                dateClick: ({ dateStr, allDay, view, resource }) => {
                    if (!selectable) return
                    this.$wire.onDateSelect(
                        dateStr,
                        null,
                        allDay,
                        view,
                        resource,
                    )
                },
                select: ({ startStr, endStr, allDay, view, resource }) => {
                    if (!selectable) return
                    this.$wire.onDateSelect(
                        startStr,
                        endStr,
                        allDay,
                        view,
                        resource,
                    )
                },
                resourceLabelDidMount: function (info) {
                    var questionMark = document.createElement('span')
                    questionMark.innerHTML = `<svg style="display: inline; margin-left: 0.5rem" fill="#9da3af" height="15px" width="15px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 29.536 29.536" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M14.768,0C6.611,0,0,6.609,0,14.768c0,8.155,6.611,14.767,14.768,14.767s14.768-6.612,14.768-14.767 C29.535,6.609,22.924,0,14.768,0z M14.768,27.126c-6.828,0-12.361-5.532-12.361-12.359c0-6.828,5.533-12.362,12.361-12.362 c6.826,0,12.359,5.535,12.359,12.362C27.127,21.594,21.594,27.126,14.768,27.126z"></path> <path d="M14.385,19.337c-1.338,0-2.289,0.951-2.289,2.34c0,1.336,0.926,2.339,2.289,2.339c1.414,0,2.314-1.003,2.314-2.339 C16.672,20.288,15.771,19.337,14.385,19.337z"></path> <path d="M14.742,6.092c-1.824,0-3.34,0.513-4.293,1.053l0.875,2.804c0.668-0.462,1.697-0.772,2.545-0.772 c1.285,0.027,1.879,0.644,1.879,1.543c0,0.85-0.67,1.697-1.494,2.701c-1.156,1.364-1.594,2.701-1.516,4.012l0.025,0.669h3.42 v-0.463c-0.025-1.158,0.387-2.162,1.311-3.215c0.979-1.08,2.211-2.366,2.211-4.321C19.705,7.968,18.139,6.092,14.742,6.092z"></path> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </g> </g></svg>`

                    questionMark.setAttribute('x-tooltip', 'tooltip')
                    questionMark.setAttribute(
                        'x-data',
                        `{ tooltip: '${info.resource.extendedProps.tooltip}' }`,
                    )

                    info.el
                        .querySelector('.fc-datagrid-cell-main')
                        .appendChild(questionMark)
                },
            })

            if (document.querySelector("#daycalendar")) {
                new Draggable(document.querySelector("#daycalendar"), {
                    itemSelector: '.drag'
                });
            }


            calendar.render()

            window.addEventListener('filament-fullcalendar--refresh', () =>
                calendar.refetchEvents(),
            )

            window.addEventListener('filament-fullcalendar--addEvent', (e) => {
                const eventData = e.__livewire.params.shift()

                if (eventData) {
                    calendar.addEvent(eventData, true)
                }
            })

            window.addEventListener(
                'filament-fullcalendar--deleteResource',
                (e) => {
                    const resourceId = e.__livewire.params.shift().toString()
                    const resource = calendar.getResourceById(resourceId)

                    if (resource) {
                        resource.remove()
                    }
                },
            )

            window.addEventListener(
                'filament-fullcalendar--updateResourceParent',
                (e) => {
                    const data = e.__livewire.params.shift()
                    const resource = calendar.getResourceById(data.resourceId)

                    if (resource) {
                        resource.setProp('parentId', data.parentId)

                        if (data.title !== resource.title) {
                            resource.setProp('title', data.title)
                        }
                    }
                },
            )

            window.addEventListener(
                'filament-fullcalendar--updateEvent',
                (e) => {
                    const data = e.__livewire.params.shift()

                    const event = calendar.getEventById(data.id)

                    if (!event) {
                        return
                    }

                    if (data.title !== event.title) {
                        event.setProp('title', data.title)
                    }

                    if (data.extraLines !== event.extendedProps.extraLines) {
                        event.setExtendedProp('extraLines', data.extraLines)
                    }
                },
            )

            window.addEventListener(
                'filament-fullcalendar--updateColor',
                (e) => {
                    const data = e.__livewire.params.shift()

                    const event = calendar.getEventById(data.id)

                    event.setProp('color', data.color)
                },
            )

            window.addEventListener(
                'filament-fullcalendar--updateDate',
                (e) => {
                    const data = e.__livewire.params.shift()

                    const event = calendar.getEventById(data.id)

                    if (!event) {
                        return
                    }

                    if (data.start !== event.start || data.end !== event.end) {
                        event.setDates(data.start, data.end);
                    }
                },
            )

            window.addEventListener(
                'filament-fullcalendar--updateEventResource',
                (e) => {
                    const data = e.__livewire.params.shift()
                    const event = calendar.getEventById(data.eventId)

                    if (event) {
                        event.setExtendedProp('resourceId', data.resourceId)
                        calendar.refetchEvents()
                    }
                },
            )

            window.addEventListener(
                'filament-fullcalendar--addResourceToEvent',
                (e) => {
                    const data = e.__livewire.params.shift()
                    const event = calendar.getEventById(data.eventId)
                    const resourceId = calendar.getResourceById(data.resourceId)
                    event.setResources([...event.getResources(), resourceId])
                },
            )

            window.addEventListener(
                'filament-fullcalendar--addResource',
                (e) => {
                    const data = e.__livewire.params.shift()
                    const resourceData = {
                      id: data.resourceId,
                      title: data.title,
                    };
                    
                    if (data.parentId) {
                      resourceData.parentId = data.parentId;
                    }
                    
                    calendar.addResource(resourceData);
                },
            )

            window.addEventListener('filament-fullcalendar--prev', () => calendar.prev())
            window.addEventListener('filament-fullcalendar--next', () => calendar.next())
            window.addEventListener('filament-fullcalendar--today', () => calendar.today())
            window.addEventListener('filament-fullcalendar--goto', (event) => calendar.gotoDate(event.detail.date))


            if (contextMenu) {
                document.addEventListener('close-parent-context-menu', function(event) {
                    contextMenu.style.display = 'none'; // Show the context menu
                    contextMenu.style.opacity = '0';
                })

                document.addEventListener('click', function (event) {
                    if (!contextMenu.contains(event.target)) {
                        contextMenu.style.display = 'none'; // Hide the context menu
                    }
                });

                window.addEventListener('resize', function (event) {
                    contextMenu.style.display = 'none';
                });
            }

            function calculateContextMenuPosition(clickEvent) {
                var menuHeight = contextMenu.offsetHeight;
                var menuWidth = contextMenu.offsetWidth;

                var top = window.innerHeight < clickEvent.clientY + menuHeight ?
                    (window.innerHeight - menuHeight) : clickEvent.clientY;
                var left = window.innerWidth < clickEvent.clientX + menuWidth ?
                    (clickEvent.clientX - menuWidth) : clickEvent.clientX;

                contextMenu.style.top = top + 'px';
                contextMenu.style.left = left + 'px';
            }
        },
    }
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
}
