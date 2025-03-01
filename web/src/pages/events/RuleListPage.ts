import { t } from "@lingui/macro";

import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { EventsApi, NotificationRule } from "@goauthentik/api";

import { AKResponse } from "../../api/Client";
import { DEFAULT_CONFIG } from "../../api/Config";
import { uiConfig } from "../../common/config";
import "../../elements/buttons/SpinnerButton";
import "../../elements/forms/DeleteBulkForm";
import "../../elements/forms/ModalForm";
import { TableColumn } from "../../elements/table/Table";
import { TablePage } from "../../elements/table/TablePage";
import "../policies/BoundPoliciesList";
import "./RuleForm";

@customElement("ak-event-rule-list")
export class RuleListPage extends TablePage<NotificationRule> {
    expandable = true;
    checkbox = true;

    searchEnabled(): boolean {
        return true;
    }
    pageTitle(): string {
        return t`Notification Rules`;
    }
    pageDescription(): string {
        return t`Send notifications whenever a specific Event is created and matched by policies.`;
    }
    pageIcon(): string {
        return "pf-icon pf-icon-attention-bell";
    }

    @property()
    order = "name";

    async apiEndpoint(page: number): Promise<AKResponse<NotificationRule>> {
        return new EventsApi(DEFAULT_CONFIG).eventsRulesList({
            ordering: this.order,
            page: page,
            pageSize: (await uiConfig()).pagination.perPage,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn(t`Name`, "name"),
            new TableColumn(t`Severity`, "severity"),
            new TableColumn(t`Sent to group`, "group"),
            new TableColumn(t`Actions`),
        ];
    }

    renderToolbarSelected(): TemplateResult {
        const disabled = this.selectedElements.length < 1;
        return html`<ak-forms-delete-bulk
            objectLabel=${t`Notification rule(s)`}
            .objects=${this.selectedElements}
            .usedBy=${(item: NotificationRule) => {
                return new EventsApi(DEFAULT_CONFIG).eventsRulesUsedByList({
                    pbmUuid: item.pk,
                });
            }}
            .delete=${(item: NotificationRule) => {
                return new EventsApi(DEFAULT_CONFIG).eventsRulesDestroy({
                    pbmUuid: item.pk,
                });
            }}
        >
            <button ?disabled=${disabled} slot="trigger" class="pf-c-button pf-m-danger">
                ${t`Delete`}
            </button>
        </ak-forms-delete-bulk>`;
    }

    row(item: NotificationRule): TemplateResult[] {
        return [
            html`${item.name}`,
            html`${item.severity}`,
            html`${item.groupObj?.name || t`None (rule disabled)`}`,
            html`<ak-forms-modal>
                <span slot="submit"> ${t`Update`} </span>
                <span slot="header"> ${t`Update Notification Rule`} </span>
                <ak-event-rule-form slot="form" .instancePk=${item.pk}> </ak-event-rule-form>
                <button slot="trigger" class="pf-c-button pf-m-plain">
                    <i class="fas fa-edit"></i>
                </button>
            </ak-forms-modal>`,
        ];
    }

    renderToolbar(): TemplateResult {
        return html`
            <ak-forms-modal>
                <span slot="submit"> ${t`Create`} </span>
                <span slot="header"> ${t`Create Notification Rule`} </span>
                <ak-event-rule-form slot="form"> </ak-event-rule-form>
                <button slot="trigger" class="pf-c-button pf-m-primary">${t`Create`}</button>
            </ak-forms-modal>
            ${super.renderToolbar()}
        `;
    }

    renderExpanded(item: NotificationRule): TemplateResult {
        return html` <td role="cell" colspan="4">
            <div class="pf-c-table__expandable-row-content">
                <p>
                    ${t`These bindings control upon which events this rule triggers. Bindings to
                groups/users are checked against the user of the event.`}
                </p>
                <ak-bound-policies-list .target=${item.pk}> </ak-bound-policies-list>
            </div>
        </td>`;
    }
}
