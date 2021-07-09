import 'cloud-ui.vusion/cloud-ui.css';
import _ from 'lodash';
import Vue from 'vue';
window._ = _;
window.Vue = Vue;
import * as CloudUI from 'cloud-ui.vusion';
window.CloudUI = CloudUI;
export * from 'cloud-ui.vusion';
export * from '@necfe/cloud-ui-internal';
import './base/index.css';

import ILineAwesome from 'i-line-awesome.vue';
export { ILineAwesome };

export { default as Icons } from './common/u-icons.vue';
// export { default as ResizeTableColumn } from './cloud-ui/u-resize-table-column.vue';
// export { default as ResizeTable } from './cloud-ui/u-resize-table.vue';
export { default as NavbarItem } from './cloud-ui/u-navbar-item.vue';
export { default as SidebarSuggest } from './cloud-ui/u-sidebar-suggest.vue';
export { default as SidebarSuggestItem } from './cloud-ui/u-sidebar-suggest-item.vue';
export { default as Sidebar } from './common/u-sidebar.vue';
// export { default as Search } from './common/search/index.vue';
// export { default as SidebarItem } from './common/u-sidebar-item.vue';
// export { default as SidebarGroup } from './common/u-sidebar-group.vue';
// export { default as BuildStatusIcon } from './common/u-build-status-icon.vue';
// export { default as Back } from './common/u-back.vue';
export { default as Page } from './common/u-page.vue';
export { default as Note } from './common/u-note.vue';
export { default as Notice } from './common/u-notice.vue';
// export { default as Section } from './common/u-section.vue';
export { default as Refresh } from './common/u-refresh.vue';
export { default as HeaderLogo } from './common/u-header-logo.vue';
// export { default as ICrumb } from './common/u-crumb.vue';
export { default as Crumb } from './cloud-ui/u-crumb.vue';
export { default as CrumbItem } from './cloud-ui/u-crumb-item.vue';
export { default as SideList } from './common/u-sidelist.vue';
export { default as StepProcess } from './common/u-step-process.vue';
export { default as Confirm } from './common/u-confirm.vue';
export { default as Chips } from './common/u-chips.vue';
export { default as Labels } from './common/u-labels.vue';
// export { default as Uhead } from './common/u-head.vue';
export { default as UheadCard } from './common/u-head-card.vue';
export { default as Foot } from './common/u-foot.vue';
export { default as Alert } from './common/u-alert.vue';
export { default as Copy } from './common/u-copy.vue';
export { default as Card } from './common/u-card.vue';
// export { default as Bread } from './common/u-bread.vue';
// export { default as BlockInfo } from './common/u-block-info.vue';
// export { default as BlockInfoItem } from './common/u-block-info-item.vue';
// export { default as CardInfo } from './common/u-card-info.vue';
// export { default as CardInfoItem } from './common/u-card-info-item.vue';
export { default as DetailOperate } from './common/u-detail-operate.vue';
export { default as DetailOperateItem } from './common/u-detail-operate-item.vue';
// export { default as MetaInfo } from './common/u-meta-info.vue';
// export { default as CheckboxCard } from './common/u-checkbox-card.vue';
// export { default as PathTable } from './common/form/u-path-table.vue';
// export { default as FormTable } from './common/form/u-form-table.vue';
// export { default as FormTableRemoveButton } from './common/form/u-form-table-remove-button.vue';
// export { default as FormTableAddButton } from './common/form/u-form-table-add-button.vue';
// export { default as FormTableTr } from './common/form/u-form-table-tr.vue';
// export { default as FormItems } from './common/form/u-form-items.vue';
// export { default as Tip } from './common/u-tip.vue';
// export { default as Piece } from './common/u-piece.vue';
// export { default as InputSearch } from './common/u-input-search.vue';
export { default as PopperSelect } from './common/u-popper-select.vue';
// export { default as SelectWithEmpty } from './common/u-select-with-empty.vue';
// export { default as QuickCreate } from './common/u-quick-create.vue';

// export { default as RepoPanel } from './common/modal/u-repo-panel.vue';
// export { default as FormModal } from './common/modal/u-form-modal.vue';

// export { default as TableCellItems } from './common/table/u-table-cell-items.vue';
// export { default as TableCellMores } from './common/table/u-table-cell-mores.vue';

// export { default as multiAdd } from './common/form/u-multi-add.vue';
export { default as SubmitButton } from './common/form/u-submit-button.vue';
// export { default as ValidateInput } from './common/form/u-validate-input.vue';
// export { default as PasswordInput } from './common/form/u-password-input.vue';

// export { default as WheatherIcon } from './special/weather-icon.vue';
export { Transfer } from 'cloud-ui.vusion';
// export { default as MonitorChart } from './common/u-monitor-chart.vue';
// export { default as Monitors } from './common/monitor/u-monitors.vue';
// export { default as MonitorsEnhance } from './common/monitor/u-monitors-enhance.vue';

// export { default as Panel } from './cloud-ui/u-panel.vue';
// export { default as PanelGroup } from './cloud-ui/u-panel-group.vue';
// export { default as NumberCard } from './cloud-ui/u-number-card.vue';

// export { default as TextareaConfig } from './common/u-textarea-config.vue';
// export { default as InputsEnv } from './common/u-inputs-env.vue';
// export { default as InputsDir } from './common/u-inputs-dir.vue';
// export { default as InputsVolume } from './common/u-inputs-volume.vue';
// export { default as ContainerResource } from './common/u-container-resource.vue';
// export { default as InputsLabel } from './common/u-inputs-label.vue';
export { default as EasyCopy } from './common/u-easy-copy.vue';
// export { default as EditImage } from './common/u-edit-image.vue';
// export { default as SelectImage } from './common/u-select-image.vue';
// export { default as InputsHeader } from './common/u-inputs-header.vue';
// export { default as ConfigProbe } from './common/u-config-probe.vue';
// export { default as ConfigAffinity } from './common/u-config-affinity.vue';
// export { default as InputsAffinityRule } from './common/u-inputs-affinity-rule.vue';
// export { default as IconInput } from './common/u-icon-input.vue';
export { default as CodeText } from './common/u-code-text.vue';
// export { default as SlideModal } from './common/u-slide-modal.vue';
// export { default as SortRadio } from './common/u-sort-radio.vue';
// export { default as SortRadios } from './common/u-sort-radios.vue';
// export { default as TableViewCell } from './common/u-table-view-cell.vue';
// export { default as TableViewColumn } from './common/u-table-column.vue';
// export { default as TableView } from './common/u-table-view.vue';
// export { default as SideNav } from './common/u-sidenav.vue';

// export { default as ViewYaml } from './special/u-view-yaml.vue';

// u-sidebar
export { default as SidebarHeader } from './common/u-sidebar-header.vue';
export { default as MiddleNav } from './common/middle-nav.vue';

// export { default as SelectEx } from './common/u-select-ex.vue';

// export { default as TutorialModal } from './common/u-tutorial-modal.vue';
// export { default as TutorialPopup } from './common/u-tutorial-popup.vue';

// loading
export { default as Spinner } from './cloud-ui/u-spinner.vue';
export { default as Toast } from './common/u-toast.vue';

// fix button
export { default as Button } from './cloud-ui/u-button.vue';

export { default as StatusIcon } from './cloud-ui/u-status-icon.vue';

// export { default as Diff } from './common/u-diff.vue';
// export { default as YamlDiff } from './common/u-yaml-diff.vue';

// export { default as MultiFilter } from './common/u-multi-filter.vue';
