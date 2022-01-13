import {pageCommonStyles} from '../../../../../../styles/page-common-styles';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../../styles/shared-styles';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-content-panel';
import '@unicef-polymer/etools-loading';
import '@polymer/paper-icon-button';
import '@polymer/paper-button';
import '@polymer/iron-icons/editor-icons';
import {html, PolymerElement} from '@polymer/polymer/polymer-element';
import {getUniqueId} from '../../../../../../utils/utils';
import {property} from '@polymer/decorators/lib/decorators';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin';
import clone from 'lodash-es/clone';
import {monitoringActivitiesStyles} from './monitoring-activities.styles';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {Partner} from '../../../../../../../models/partners.models';

type ActivitiesGroup = {
  activities: MonitoringActivity[];
  id: string;
};

enum DragAndDropClasses {
  originGroup = 'origin-group',
  originRow = 'original-row',
  row = 'row',
  cloned = 'cloned-row',
  activities = 'activities',
  hovered = 'hovered',
  removeBtn = 'remove',
  grouped = 'grouped'
}

export class MonitoringActivities extends EndpointsMixin(PolymerElement) {
  static get template() {
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${monitoringActivitiesStyles}
      <etools-content-panel
        id="monitoring-activities-panel"
        class="content-section"
        panel-title="Monitoring Activities"
      >
        <template is="dom-if" if="[[showEditBtn(activities, isReadonly)]]">
          <div slot="panel-btns">
            <paper-icon-button icon="create" title="Edit" on-click="startEdit"> </paper-icon-button>
          </div>
        </template>

        <etools-loading active="[[loading]]"></etools-loading>

        <template is="dom-if" if="[[!activities.length]]">
          <div class="no-activities">There are no activities</div>
        </template>

        <template is="dom-if" if="[[activities.length]]">
          <div class="row panel-row-tall layout-horizontal">
            <etools-data-table-column class="flex-2 cell">Reference #</etools-data-table-column>
            <etools-data-table-column class="flex-1 cell">Start Date</etools-data-table-column>
            <etools-data-table-column class="flex-1 cell">End Date</etools-data-table-column>
            <etools-data-table-column class="flex-2 cell">Location (Site)</etools-data-table-column>
          </div>
        </template>

        <template is="dom-repeat" items="[[mappedGroups]]">
          <div class$="activities [[groupedClass(item.activities.length)]]" data-group-id$="[[item.id]]">
            <div class="braces">
              <div class="description">Count as one</div>
            </div>
            <div class="remove" data-is-remove>
              <div class="remove-button">
                <div class="description">Remove from group</div>
              </div>
            </div>
            <template is="dom-repeat" items="[[item.activities]]" as="activity">
              <div class="row layout-horizontal" data-group-id$="[[item.id]]" data-activity-id$="[[activity.id]]">
                <div class="flex-2 cell">
                  <iron-icon
                    hidden$="[[!editMode]]"
                    class="flex-none"
                    icon="editor:drag-handle"
                    on-mousedown="startDrag"
                  ></iron-icon>
                  <template is="dom-if" if="[[!editMode]]">
                    <a target="_blank" title="[[activity.id]]" href$="/fm/activities/[[activity.id]]/details">
                      [[activity.reference_number]]
                    </a>
                  </template>
                  <template is="dom-if" if="[[editMode]]">[[activity.reference_number]]</template>
                </div>
                <div class="flex-1 cell">[[activity.start_date]]</div>
                <div class="flex-1 cell">[[activity.end_date]]</div>
                <div class="flex-2 cell">[[locationAndSite(activity.location.name, activity.location_site.name)]]</div>
              </div>
            </template>
          </div>
        </template>
        <div class="actions" hidden$="[[!editMode]]">
          <paper-button on-tap="cancelEdit">Cancel</paper-button>
          <paper-button raised class="save" on-tap="saveGroups">Save</paper-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  set activityGroups(groups: number[][]) {
    if (groups) {
      this.groups = clone(groups);
      this.originalGroups = groups;
      this.mapActivitiesToGroups();
    }
  }

  @property({type: Boolean})
  isReadonly = true;

  @property({type: Boolean})
  loading = true;

  @property({type: Boolean})
  editMode = false;

  @property({type: Number})
  set partnerId(id: number) {
    if (this._partnerId !== id) {
      this._partnerId = id;
      this.loadActivities();
    }
  }

  @property({type: Array})
  activities: MonitoringActivity[] | null = null;
  groups: number[][] | null = null;
  originalGroups: number[][] | null = null;

  @property({type: Object})
  mappedGroups: ActivitiesGroup[] = [];

  private offset: any = {
    x: 0,
    y: 0
  };
  private clonedRow: HTMLElement | null = null;
  private groupsBoundingMap: Map<HTMLElement, ClientRect> = new Map();
  private currentlyHoveredElement: HTMLElement | null = null;
  private _partnerId!: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  loadActivities() {
    this.mappedGroups = [];
    if (!this._partnerId) {
      return;
    }
    this.loading = true;
    sendRequest({
      endpoint: this.getEndpoint('partnerActivities', {id: this._partnerId})
    }).then((response: any) => {
      this.activities = response.results;
      this.mapActivitiesToGroups();
      this.loading = false;
    });
  }

  showEditBtn(activities: MonitoringActivity[], isReadonly: boolean): boolean {
    return Boolean(activities?.length) && !isReadonly;
  }

  startEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.groups = clone(this.originalGroups);
    this.editMode = false;
    this.mapActivitiesToGroups();
  }

  groupedClass(length: number): string {
    return length > 1 ? DragAndDropClasses.grouped : '';
  }

  startDrag(event: MouseEvent): void {
    // get parent elements
    const row: HTMLElement = (event.target as HTMLElement).closest(`.${DragAndDropClasses.row}`) as HTMLElement;
    const group: HTMLElement = row.closest(`.${DragAndDropClasses.activities}`) as HTMLElement;
    group.classList.add(DragAndDropClasses.originGroup);
    row.classList.add(DragAndDropClasses.originRow);

    // set mouse offset
    const {left, top, width} = row.getBoundingClientRect();
    this.offset.x = event.clientX - left;
    this.offset.y = event.clientY - top;

    // create draggable element, add classes and styles to it
    this.clonedRow = row.cloneNode(true) as HTMLElement;
    this.clonedRow.classList.add(DragAndDropClasses.cloned);
    this.clonedRow.style.width = `${width}px`;
    this.setCopyPosition(event.clientX, event.clientY);
    this.shadowRoot!.append(this.clonedRow);

    // map all groups (and remove btn for origin group) bounding to detect hover
    this.createBoundingMap(group);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove({clientX, clientY}: MouseEvent) {
    this.setCopyPosition(clientX, clientY);
    let hovered = false;
    for (const [group, bounding] of this.groupsBoundingMap.entries()) {
      if (
        clientX >= bounding.left &&
        clientX <= bounding.right &&
        clientY >= bounding.top &&
        clientY <= bounding.bottom
      ) {
        // remove hovered styles from previous element if exist
        if (this.currentlyHoveredElement && this.currentlyHoveredElement !== group) {
          this.currentlyHoveredElement?.classList.remove(DragAndDropClasses.hovered);
        }
        this.currentlyHoveredElement = group;
        group.classList.add(DragAndDropClasses.hovered);
        hovered = true;
        break;
      }
    }
    if (!hovered && this.currentlyHoveredElement) {
      this.currentlyHoveredElement.classList.remove(DragAndDropClasses.hovered);
      this.currentlyHoveredElement = null;
    }
  }

  onMouseUp() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.clonedRow?.remove();
    this.clonedRow = null;
    this.shadowRoot!.querySelector(`.${DragAndDropClasses.originGroup}`)!.classList.remove(
      DragAndDropClasses.originGroup
    );
    this.groupsBoundingMap.clear();
    const originalRow = this.shadowRoot!.querySelector(`.${DragAndDropClasses.originRow}`) as HTMLElement;
    // if other elements are not hovered (remove btn or other group)
    if (!this.currentlyHoveredElement) {
      originalRow.classList.remove(DragAndDropClasses.originRow);
      return;
    }
    // get ids
    const currentGroupId: string = originalRow.dataset.groupId as string;
    const currentActivityId = originalRow.dataset.activityId;
    const targetGroup = this.currentlyHoveredElement.dataset.groupId;

    // remove activity from current group
    const activity = this.removeFromGroup(currentGroupId, Number(currentActivityId));

    // remove hover classes
    this.currentlyHoveredElement.classList.remove('hovered');
    this.currentlyHoveredElement = null;
    originalRow.classList.remove(DragAndDropClasses.originRow);

    // add to new group if needed
    if (targetGroup) {
      const groupIndex: number = this.mappedGroups.findIndex(({id}: ActivitiesGroup) => id === targetGroup);
      this.mappedGroups[groupIndex].activities.push(activity);
    }

    // re-map groups with activities
    this.groups = this.mappedActivitiesToGroups(this.mappedGroups);
    this.mapActivitiesToGroups();
  }

  removeFromGroup(groupId: string, activityId: number) {
    const groupIndex: number = this.mappedGroups.findIndex(({id}: ActivitiesGroup) => id === groupId);
    const activitiesLength: number = this.mappedGroups[groupIndex].activities.length;
    if (activitiesLength === 1) {
      const activity = this.mappedGroups[groupIndex].activities[0];
      this.mappedGroups.splice(groupIndex, 1);
      return activity;
    } else {
      const activityIndex: number = this.mappedGroups[groupIndex].activities.findIndex(
        ({id}: MonitoringActivity) => id === activityId
      );
      return this.mappedGroups[groupIndex].activities.splice(activityIndex, 1)[0];
    }
  }

  locationAndSite(location: string, site: string): string {
    return site ? `${location} - ${site}` : location;
  }

  setCopyPosition(x: number, y: number): void {
    if (!this.clonedRow) {
      return;
    }
    this.clonedRow.style.left = `${x - this.offset.x}px`;
    this.clonedRow.style.top = `${y - this.offset.y}px`;
  }

  saveGroups(): void {
    this.loading = true;
    sendRequest({
      endpoint: this.getEndpoint('partnerDetails', {id: this._partnerId}),
      method: 'PATCH',
      body: {
        monitoring_activity_groups: this.groups
      }
    })
      .then((partner) => {
        this.originalGroups = partner.monitoring_activity_groups;
        this.editMode = false;
        this.dispatchEvent(
          new CustomEvent('update-partner', {
            bubbles: true,
            composed: true,
            detail: new Partner(partner)
          })
        );
      })
      .catch((error: any) => {
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        this.mapActivitiesToGroups();
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private mapActivitiesToGroups(): void {
    if (!this.activities || !this.groups) {
      return;
    }
    // map activities by id
    const activitiesMap: Map<number, MonitoringActivity> = this.activities.reduce(
      (map: Map<number, MonitoringActivity>, activity: MonitoringActivity) => {
        map.set(activity.id, activity);
        return map;
      },
      new Map()
    );
    // transform groups to activities array, add to map
    const groupedActivities: ActivitiesGroup[] = [];
    this.groups.forEach((group: number[]) => {
      const activities: MonitoringActivity[] = group.map((id: number) => {
        const activity = activitiesMap.get(id) as MonitoringActivity;
        activitiesMap.delete(id);
        return activity;
      });
      groupedActivities.push({activities, id: getUniqueId()});
    });
    // transform single activities to array with one element, add to map
    Array.from(activitiesMap.values()).forEach((activity) =>
      groupedActivities.push({activities: [activity], id: getUniqueId()})
    );
    this.mappedGroups = groupedActivities;
  }

  private createBoundingMap(origin: HTMLElement): void {
    const elements: HTMLElement[] = Array.from(this.shadowRoot!.querySelectorAll(`.${DragAndDropClasses.activities}`));
    elements.forEach((element: HTMLElement) => {
      const targetElement: HTMLElement =
        element === origin ? (element.querySelector(`.${DragAndDropClasses.removeBtn}`) as HTMLElement) : element;
      this.groupsBoundingMap.set(targetElement, targetElement.getBoundingClientRect());
    });
  }

  private mappedActivitiesToGroups(map: ActivitiesGroup[]): number[][] {
    return map
      .map(({activities}: ActivitiesGroup) => activities.map(({id}) => id))
      .filter((ids: number[]) => ids.length > 1);
  }
}

window.customElements.define('monitoring-activities', MonitoringActivities);
