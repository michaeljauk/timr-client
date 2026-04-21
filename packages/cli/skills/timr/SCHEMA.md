# timr API — field reference

Auto-generated from `openapi.json` (timr API **0.2.14**). Do not hand-edit.

Every list endpoint returns `{ data: T[], next_page_token: string | null }`. The tables below document `T` for each resource, plus all nested schemas referenced from responses.

## List resources

| CLI | Endpoint | Item type |
|---|---|---|
| `timr users list` | `GET /users` | [User](#user) |
| `timr teams list` | `GET /teams` | [Team](#team) |
| `timr work-schedule-models list` | `GET /work-schedule-models` | [WorkScheduleModel](#workschedulemodel) |
| `timr working-times list` | `GET /working-times` | [WorkingTime](#workingtime) |
| `timr project-times list` | `GET /project-times` | [ProjectTime](#projecttime) |
| `timr tasks list` | `GET /tasks` | [Task](#task) |
| `timr drive-logs list` | `GET /drive-logs` | [DriveLog](#drivelog) |
| `timr cars list` | `GET /cars` | [Car](#car) |
| `timr drive-log-categories list` | `GET /drive-log-categories` | [DriveLogCategory](#drivelogcategory) |
| `timr working-time-requests list` | `GET /working-time-requests` | [WorkingTimeRequest](#workingtimerequest) |
| `timr working-time-date-spans list` | `GET /working-time-date-spans` | [WorkingTimeDateSpan](#workingtimedatespan) |
| `timr working-time-types list` | `GET /working-time-types` | [WorkingTimeType](#workingtimetype) |
| `timr holiday-calendars list` | `GET /holiday-calendars` | [HolidayCalendarPartial](#holidaycalendarpartial) |

## Schemas

### Allowances

| field | type | required |
|---|---|---|
| `balance_last_period_minutes` | integer \| null | yes |
| `balance_current_period_minutes` | integer \| null | yes |
| `balance_total_minutes` | integer \| null | yes |

### AutomaticBreakDeductionPolicy

_no documented fields_

### BreakTime

One of: [BreakTimeManual](#breaktimemanual) or [BreakTimeOngoing](#breaktimeongoing) or [BreakTimeAutomatic](#breaktimeautomatic)

### BreakTimeAutomatic

| field | type | required |
|---|---|---|
| `type` | string | yes |
| `duration_minutes` | integer | yes |
| `start` | [DateTime](#datetime) \| null | yes |
| `end` | [DateTime](#datetime) \| null | yes |

### BreakTimeManual

| field | type | required |
|---|---|---|
| `type` | string | yes |
| `duration_minutes` | integer | yes |
| `start` | [DateTime](#datetime) \| null |  |
| `end` | [DateTime](#datetime) \| null |  |

### BreakTimeOngoing

| field | type | required |
|---|---|---|
| `type` | string | yes |
| `start` | [DateTime](#datetime) | yes |

### BreakTimeType

_no documented fields_

### BreakTimeUpdate

One of: [BreakTimeManual](#breaktimemanual) or [BreakTimeOngoing](#breaktimeongoing)

### BudgetPlanningType

_no documented fields_

### Car

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `plate` | string | yes |
| `external_id` | string \| null | yes |
| `usable` | boolean |  |

### CarPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `plate` | string | yes |
| `external_id` | string \| null | yes |

### CarsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [Car](#car)[] | yes |

### CarsSortColumn

_no documented fields_

### DailyWorkSchedule

| field | type | required |
|---|---|---|
| `target_duration_minutes` | integer | yes |
| `normal_working_times` | [NormalWorkingTimes](#normalworkingtimes)[] |  |

### DateTime

_no documented fields_

### DeletedEntryPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [DeletedEntryPartial](#deletedentrypartial)[] | yes |

### DeletedEntryPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |

### DeletedEntrySortColumn

_no documented fields_

### DeletedEntryWithMetadata

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |
| `metadata` | object \| null |  |

### DeletedEntryWithMetadataPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [DeletedEntryWithMetadata](#deletedentrywithmetadata)[] | yes |

### DeletedEntryWithMetadataSortColumn

_no documented fields_

### DriveLog

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `start` | [DateTime](#datetime) | yes |
| `end` | [DateTime](#datetime) \| null | yes |
| `duration` | [Duration](#duration) \| null | yes |
| `changed` | boolean | yes |
| `start_mileage` | integer | yes |
| `end_mileage` | integer \| null | yes |
| `distance` | integer \| null | yes |
| `route` | string \| null | yes |
| `purpose` | string \| null | yes |
| `visited` | string \| null | yes |
| `user` | [UserPartial](#userpartial) | yes |
| `car` | [CarPartial](#carpartial) | yes |
| `drive_log_category` | [DriveLogCategoryPartial](#drivelogcategorypartial) | yes |
| `start_venue` | [VenuePartial](#venuepartial) \| null | yes |
| `end_venue` | [VenuePartial](#venuepartial) \| null | yes |
| `has_track` | boolean | yes |
| `start_location` | [Location](#location) \| null | yes |
| `end_location` | [Location](#location) \| null | yes |
| `start_platform` | [Platform](#platform) | yes |
| `end_platform` | [Platform](#platform) \| null | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |
| `status` | [DriveLogStatus](#drivelogstatus) | yes |

### DriveLogCategoriesPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [DriveLogCategory](#drivelogcategory)[] | yes |

### DriveLogCategoriesSortColumn

_no documented fields_

### DriveLogCategory

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `business` | boolean | yes |
| `color` | string | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |

### DriveLogCategoryPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `business` | boolean | yes |
| `color` | string | yes |

### DriveLogCreate

| field | type | required |
|---|---|---|
| `start` | [DateTime](#datetime) | yes |
| `end` | [DateTime](#datetime) \| null |  |
| `changed` | boolean | yes |
| `start_mileage` | integer | yes |
| `end_mileage` | integer \| null |  |
| `route` | string \| null |  |
| `purpose` | string \| null |  |
| `visited` | string \| null |  |
| `drive_log_category_id` | string | yes |
| `start_location` | [Location](#location) \| null |  |
| `end_location` | [Location](#location) \| null |  |
| `status` | [DriveLogStatus](#drivelogstatus) | yes |
| `user_id` | string | yes |
| `car_id` | string | yes |

### DriveLogStatus

_no documented fields_

### DriveLogUpdate

| field | type | required |
|---|---|---|
| `start` | [DateTime](#datetime) |  |
| `end` | [DateTime](#datetime) \| null |  |
| `changed` | boolean |  |
| `start_mileage` | integer |  |
| `end_mileage` | integer \| null |  |
| `route` | string \| null |  |
| `purpose` | string \| null |  |
| `visited` | string \| null |  |
| `drive_log_category_id` | string |  |
| `start_location` | [Location](#location) \| null |  |
| `end_location` | [Location](#location) \| null |  |
| `status` | [DriveLogStatus](#drivelogstatus) |  |

### DriveLogsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [DriveLog](#drivelog)[] | yes |

### DriveLogsSortColumn

_no documented fields_

### Duration

| field | type | required |
|---|---|---|
| `type` | [DurationType](#durationtype) | yes |
| `minutes` | integer | yes |
| `minutes_rounded` | integer | yes |

### DurationType

_no documented fields_

### DurationUnit

_no documented fields_

### Error

| field | type | required |
|---|---|---|
| `code` | string \| null | yes |
| `message` | string \| null | yes |

### FlexTimeIndicator

_no documented fields_

### Holiday

| field | type | required |
|---|---|---|
| `date` | [LocalDate](#localdate) | yes |
| `description` | string | yes |
| `half_day` | boolean | yes |

### HolidayCalendarPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `description` | string | yes |

### HolidayCalendarsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [HolidayCalendarPartial](#holidaycalendarpartial)[] | yes |

### HolidayCalendarsSortColumn

_no documented fields_

### HolidaysPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [Holiday](#holiday)[] | yes |

### HolidaysSortColumn

_no documented fields_

### LocalDate

_no documented fields_

### LocalTime

_no documented fields_

### Location

| field | type | required |
|---|---|---|
| `lat` | number | yes |
| `lon` | number | yes |
| `timestamp` | [DateTime](#datetime) \| null |  |
| `formatted_address` | string \| null |  |

### NormalWorkingTimes

| field | type | required |
|---|---|---|
| `start` | string \| null |  |
| `end` | string \| null |  |

### Overtime

| field | type | required |
|---|---|---|
| `balance_last_period_minutes` | integer \| null | yes |
| `balance_current_period_minutes` | integer \| null | yes |
| `balance_total_minutes` | integer \| null | yes |

### PagingInformation

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |

### Platform

_no documented fields_

### ProjectTime

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `start` | [DateTime](#datetime) | yes |
| `end` | [DateTime](#datetime) \| null | yes |
| `break_time_total_minutes` | integer | yes |
| `break_times` | [BreakTime](#breaktime)[] | yes |
| `duration` | [Duration](#duration) \| null | yes |
| `changed` | boolean | yes |
| `notes` | string \| null | yes |
| `user` | [UserPartial](#userpartial) | yes |
| `task` | [TaskPartial](#taskpartial) | yes |
| `billable` | boolean | yes |
| `start_location` | [Location](#location) \| null | yes |
| `end_location` | [Location](#location) \| null | yes |
| `start_platform` | [Platform](#platform) | yes |
| `end_platform` | [Platform](#platform) \| null | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |
| `status` | [ProjectTimeStatus](#projecttimestatus) | yes |
| `metadata` | object \| null |  |

### ProjectTimeCreate

| field | type | required |
|---|---|---|
| `user_id` | string | yes |
| `start` | [DateTime](#datetime) | yes |
| `end` | [DateTime](#datetime) \| null |  |
| `break_times` | [BreakTimeUpdate](#breaktimeupdate)[] |  |
| `changed` | boolean | yes |
| `notes` | string \| null |  |
| `task_id` | string | yes |
| `billable` | boolean |  |
| `start_location` | [Location](#location) \| null |  |
| `end_location` | [Location](#location) \| null |  |
| `status` | [ProjectTimeStatus](#projecttimestatus) | yes |
| `metadata` | object \| null |  |

### ProjectTimeStatus

_no documented fields_

### ProjectTimeUpdate

| field | type | required |
|---|---|---|
| `start` | [DateTime](#datetime) |  |
| `end` | [DateTime](#datetime) \| null |  |
| `break_times` | [BreakTimeUpdate](#breaktimeupdate)[] |  |
| `changed` | boolean |  |
| `notes` | string \| null |  |
| `task_id` | string |  |
| `billable` | boolean |  |
| `start_location` | [Location](#location) \| null |  |
| `end_location` | [Location](#location) \| null |  |
| `status` | [ProjectTimeStatus](#projecttimestatus) |  |
| `metadata` | object \| null |  |

### ProjectTimesPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [ProjectTime](#projecttime)[] | yes |

### ProjectTimesSortColumn

_no documented fields_

### RecordingLockType

_no documented fields_

### RecordingModeUser

_no documented fields_

### SortDirection

_no documented fields_

### Task

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `breadcrumbs` | string | yes |
| `external_id` | string \| null | yes |
| `parent_task` | [TaskPartial](#taskpartial) \| null | yes |
| `description` | string \| null | yes |
| `description_external` | string \| null | yes |
| `bookable` | boolean | yes |
| `billable` | boolean | yes |
| `project_time_notes_required` | boolean | yes |
| `start_date` | [LocalDate](#localdate) \| null | yes |
| `end_date` | [LocalDate](#localdate) \| null | yes |
| `lock_date` | [LocalDate](#localdate) \| null |  |
| `earliest_start_time` | [LocalTime](#localtime) \| null | yes |
| `latest_end_time` | [LocalTime](#localtime) \| null | yes |
| `active_from` | [LocalDate](#localdate) \| null | yes |
| `active_to` | [LocalDate](#localdate) \| null | yes |
| `budget_inherited` | boolean |  |
| `budget_planning_type` | [BudgetPlanningType](#budgetplanningtype) |  |
| `budget_hours_planned` | number \| null |  |
| `budget_hourly_rate` | number \| null |  |
| `budget_planned` | number \| null |  |
| `budget_include_non_billable_project_times` | boolean |  |
| `location_inherited` | boolean |  |
| `location` | [TaskLocation](#tasklocation) \| null |  |
| `location_restriction_radius_meters` | integer \| null |  |
| `custom_field_1` | string \| null | yes |
| `custom_field_2` | string \| null | yes |
| `custom_field_3` | string \| null | yes |
| `metadata` | object \| null |  |

### TaskBase

| field | type | required |
|---|---|---|
| `name` | string |  |
| `parent_task_id` | string \| null |  |
| `external_id` | string \| null |  |
| `description` | string \| null |  |
| `description_external` | string \| null |  |
| `bookable` | boolean |  |
| `billable` | boolean |  |
| `project_time_notes_required` | boolean |  |
| `start_date` | [LocalDate](#localdate) \| null |  |
| `end_date` | [LocalDate](#localdate) \| null |  |
| `lock_date` | [LocalDate](#localdate) \| null |  |
| `earliest_start_time` | [LocalTime](#localtime) \| null |  |
| `latest_end_time` | [LocalTime](#localtime) \| null |  |
| `budget_inherited` | boolean |  |
| `budget_planning_type` | [BudgetPlanningType](#budgetplanningtype) |  |
| `budget_hours_planned` | number \| null |  |
| `budget_hourly_rate` | number \| null |  |
| `budget_planned` | number \| null |  |
| `budget_include_non_billable_project_times` | boolean |  |
| `location_inherited` | boolean |  |
| `location` | [TaskLocation](#tasklocation) \| null |  |
| `location_restriction_radius_meters` | integer \| null |  |
| `custom_field_1` | string \| null |  |
| `custom_field_2` | string \| null |  |
| `custom_field_3` | string \| null |  |
| `metadata` | object \| null |  |

### TaskCreate

| field | type | required |
|---|---|---|
| `name` | string | yes |
| `parent_task_id` | string \| null |  |
| `external_id` | string \| null |  |
| `description` | string \| null |  |
| `description_external` | string \| null |  |
| `bookable` | boolean | yes |
| `billable` | boolean | yes |
| `project_time_notes_required` | boolean |  |
| `start_date` | [LocalDate](#localdate) \| null |  |
| `end_date` | [LocalDate](#localdate) \| null |  |
| `lock_date` | [LocalDate](#localdate) \| null |  |
| `earliest_start_time` | [LocalTime](#localtime) \| null |  |
| `latest_end_time` | [LocalTime](#localtime) \| null |  |
| `budget_inherited` | boolean |  |
| `budget_planning_type` | [BudgetPlanningType](#budgetplanningtype) |  |
| `budget_hours_planned` | number \| null |  |
| `budget_hourly_rate` | number \| null |  |
| `budget_planned` | number \| null |  |
| `budget_include_non_billable_project_times` | boolean |  |
| `location_inherited` | boolean |  |
| `location` | [TaskLocation](#tasklocation) \| null |  |
| `location_restriction_radius_meters` | integer \| null |  |
| `custom_field_1` | string \| null |  |
| `custom_field_2` | string \| null |  |
| `custom_field_3` | string \| null |  |
| `metadata` | object \| null |  |

### TaskLocation

| field | type | required |
|---|---|---|
| `lat` | number \| null | yes |
| `lon` | number \| null | yes |
| `address` | string \| null | yes |
| `city` | string \| null | yes |
| `zip_code` | string \| null | yes |
| `state` | string \| null | yes |
| `country` | string \| null | yes |

### TaskPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `breadcrumbs` | string | yes |
| `external_id` | string \| null | yes |

### TaskReduced

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `breadcrumbs` | string | yes |
| `external_id` | string \| null | yes |
| `parent_task` | [TaskPartial](#taskpartial) \| null | yes |
| `description` | string \| null | yes |
| `bookable` | boolean | yes |
| `billable` | boolean | yes |
| `project_time_notes_required` | boolean | yes |
| `lock_date` | [LocalDate](#localdate) \| null |  |
| `earliest_start_time` | [LocalTime](#localtime) \| null | yes |
| `latest_end_time` | [LocalTime](#localtime) \| null | yes |
| `active_from` | [LocalDate](#localdate) \| null | yes |
| `active_to` | [LocalDate](#localdate) \| null | yes |
| `budget_planning_type` | [BudgetPlanningType](#budgetplanningtype) |  |
| `location_inherited` | boolean |  |
| `location` | [TaskLocation](#tasklocation) \| null |  |
| `location_restriction_radius_meters` | integer \| null |  |
| `custom_field_1` | string \| null | yes |
| `custom_field_2` | string \| null | yes |
| `custom_field_3` | string \| null | yes |

### TaskToLeaderAssignment

| field | type | required |
|---|---|---|
| `user` | [UserPartial](#userpartial) | yes |
| `automatically_assigned` | boolean | yes |

### TaskToLeaderAssignmentsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [TaskToLeaderAssignment](#tasktoleaderassignment)[] | yes |

### TaskToLeaderAssignmentsSortColumn

_no documented fields_

### TaskToTeamAssignment

| field | type | required |
|---|---|---|
| `team` | [TeamPartial](#teampartial) | yes |
| `automatically_assigned` | boolean | yes |

### TaskToTeamAssignmentsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [TaskToTeamAssignment](#tasktoteamassignment)[] | yes |

### TaskToTeamAssignmentsSortColumn

_no documented fields_

### TaskToUserAssignment

| field | type | required |
|---|---|---|
| `user` | [UserPartial](#userpartial) | yes |
| `hours_planned` | number \| null |  |
| `recording_lock` | [RecordingLockType](#recordinglocktype) | yes |
| `automatically_assigned` | boolean | yes |

### TaskToUserAssignmentCreateAndUpdate

| field | type | required |
|---|---|---|
| `hours_planned` | number \| null |  |
| `recording_lock` | [RecordingLockType](#recordinglocktype) \| null |  |

### TaskToUserAssignmentsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [TaskToUserAssignment](#tasktouserassignment)[] | yes |

### TaskToUserAssignmentsSortColumn

_no documented fields_

### TaskUpdate

| field | type | required |
|---|---|---|
| `name` | string |  |
| `parent_task_id` | string \| null |  |
| `external_id` | string \| null |  |
| `description` | string \| null |  |
| `description_external` | string \| null |  |
| `bookable` | boolean |  |
| `billable` | boolean |  |
| `project_time_notes_required` | boolean |  |
| `start_date` | [LocalDate](#localdate) \| null |  |
| `end_date` | [LocalDate](#localdate) \| null |  |
| `lock_date` | [LocalDate](#localdate) \| null |  |
| `earliest_start_time` | [LocalTime](#localtime) \| null |  |
| `latest_end_time` | [LocalTime](#localtime) \| null |  |
| `budget_inherited` | boolean |  |
| `budget_planning_type` | [BudgetPlanningType](#budgetplanningtype) |  |
| `budget_hours_planned` | number \| null |  |
| `budget_hourly_rate` | number \| null |  |
| `budget_planned` | number \| null |  |
| `budget_include_non_billable_project_times` | boolean |  |
| `location_inherited` | boolean |  |
| `location` | [TaskLocation](#tasklocation) \| null |  |
| `location_restriction_radius_meters` | integer \| null |  |
| `custom_field_1` | string \| null |  |
| `custom_field_2` | string \| null |  |
| `custom_field_3` | string \| null |  |
| `metadata` | object \| null |  |
| `budget_update_project_times` | boolean |  |

### TasksPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [Task](#task)[] | yes |

### TasksReducedPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [TaskReduced](#taskreduced)[] | yes |

### TasksSortColumn

_no documented fields_

### Team

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `breadcrumbs` | string | yes |
| `external_id` | string \| null | yes |
| `description` | string \| null | yes |
| `parent_team` | [TeamPartial](#teampartial) \| null | yes |

### TeamCreate

| field | type | required |
|---|---|---|
| `name` | string | yes |
| `description` | string \| null |  |
| `parent_team_id` | string \| null |  |
| `external_id` | string \| null |  |

### TeamPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `breadcrumbs` | string | yes |
| `external_id` | string \| null | yes |

### TeamUpdate

| field | type | required |
|---|---|---|
| `name` | string |  |
| `description` | string \| null |  |
| `parent_team_id` | string \| null |  |
| `external_id` | string \| null |  |

### TeamsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [Team](#team)[] | yes |

### TeamsPartialPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [TeamPartial](#teampartial)[] | yes |

### TeamsSortColumn

_no documented fields_

### TimeAccount

| field | type | required |
|---|---|---|
| `balance_last_period_minutes` | integer \| null | yes |
| `duration_actual_minutes` | integer \| null | yes |
| `duration_target_minutes` | integer \| null | yes |
| `balance_current_period_minutes` | integer \| null | yes |
| `balance_total_minutes` | integer \| null | yes |
| `work_from_home_days_full` | integer \| null | yes |
| `work_from_home_days_partial` | integer \| null | yes |
| `flex_time_indicator` | [FlexTimeIndicator](#flextimeindicator) \| null |  |

### Track

_no documented fields_

### User

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `firstname` | string \| null | yes |
| `lastname` | string \| null | yes |
| `fullname` | string \| null | yes |
| `email` | string \| null | yes |
| `employee_number` | string \| null | yes |
| `external_id` | string \| null | yes |
| `login` | string |  |
| `entry_date` | [LocalDate](#localdate) \| null |  |
| `resign_date` | [LocalDate](#localdate) \| null |  |
| `work_schedule_model` | [WorkScheduleModelPartial](#workschedulemodelpartial) \| null |  |
| `holiday_calendar` | [HolidayCalendarPartial](#holidaycalendarpartial) |  |
| `metadata` | object \| null |  |

### UserCreate

| field | type | required |
|---|---|---|
| `login` | string | yes |
| `firstname` | string \| null |  |
| `lastname` | string \| null |  |
| `email` | string \| null |  |
| `entry_date` | [LocalDate](#localdate) \| null |  |
| `resign_date` | [LocalDate](#localdate) \| null |  |
| `employee_number` | string \| null |  |
| `external_id` | string \| null |  |
| `metadata` | object \| null |  |
| `auth_provider` | string \| null |  |
| `auth_identifier` | string \| null |  |

### UserPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `firstname` | string \| null | yes |
| `lastname` | string \| null | yes |
| `fullname` | string \| null | yes |
| `email` | string \| null | yes |
| `employee_number` | string \| null | yes |
| `external_id` | string \| null | yes |

### UserUpdate

| field | type | required |
|---|---|---|
| `login` | string |  |
| `firstname` | string \| null |  |
| `lastname` | string \| null |  |
| `email` | string \| null |  |
| `entry_date` | [LocalDate](#localdate) \| null |  |
| `resign_date` | [LocalDate](#localdate) \| null |  |
| `employee_number` | string \| null |  |
| `external_id` | string \| null |  |
| `metadata` | object \| null |  |

### UsersPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [User](#user)[] | yes |

### UsersPartialPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [UserPartial](#userpartial)[] | yes |

### UsersSortColumn

_no documented fields_

### VenuePartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `city` | string | yes |
| `zip_code` | string | yes |
| `street` | string | yes |
| `street_number` | string | yes |
| `country` | string | yes |
| `lat` | number |  |
| `lon` | number |  |

### Waypoint

| field | type | required |
|---|---|---|
| `lat` | number | yes |
| `lon` | number | yes |

### WorkScheduleModel

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `type` | [WorkScheduleModelType](#workschedulemodeltype) | yes |
| `target_duration_weekly_minutes` | integer | yes |
| `monday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `tuesday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `wednesday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `thursday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `friday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `saturday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `sunday` | [DailyWorkSchedule](#dailyworkschedule) | yes |
| `working_time_rules` | [WorkingTimeRules](#workingtimerules) \| null | yes |

### WorkScheduleModelPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |

### WorkScheduleModelSortColumn

_no documented fields_

### WorkScheduleModelType

_no documented fields_

### WorkScheduleModelsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [WorkScheduleModel](#workschedulemodel)[] | yes |

### WorkingTime

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `start` | [DateTime](#datetime) | yes |
| `end` | [DateTime](#datetime) \| null | yes |
| `break_time_total_minutes` | integer | yes |
| `break_times` | [BreakTime](#breaktime)[] | yes |
| `duration` | [Duration](#duration) \| null | yes |
| `changed` | boolean | yes |
| `notes` | string \| null | yes |
| `user` | [UserPartial](#userpartial) | yes |
| `working_time_type` | [WorkingTimeTypePartial](#workingtimetypepartial) | yes |
| `working_time_date_span` | [WorkingTimeDateSpanPartial](#workingtimedatespanpartial) \| null | yes |
| `working_time_request` | [WorkingTimeRequestPartial](#workingtimerequestpartial) \| null | yes |
| `start_location` | [Location](#location) \| null | yes |
| `end_location` | [Location](#location) \| null | yes |
| `start_platform` | [Platform](#platform) \| null | yes |
| `end_platform` | [Platform](#platform) \| null | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |
| `status` | [WorkingTimeStatus](#workingtimestatus) | yes |
| `metadata` | object \| null |  |

### WorkingTimeAccounts

| field | type | required |
|---|---|---|
| `last_balance_date` | string \| null | yes |
| `time_account` | [TimeAccount](#timeaccount) \| null |  |
| `overtime` | [Overtime](#overtime) \| null |  |
| `allowances` | [Allowances](#allowances) \| null |  |

### WorkingTimeCreate

| field | type | required |
|---|---|---|
| `user_id` | string | yes |
| `start` | [DateTime](#datetime) | yes |
| `end` | [DateTime](#datetime) \| null |  |
| `break_times` | [BreakTimeUpdate](#breaktimeupdate)[] |  |
| `duration_type` | [DurationType](#durationtype) \| null |  |
| `changed` | boolean | yes |
| `notes` | string \| null |  |
| `working_time_type_id` | string | yes |
| `start_location` | [Location](#location) \| null |  |
| `end_location` | [Location](#location) \| null |  |
| `status` | [WorkingTimeStatus](#workingtimestatus) | yes |
| `metadata` | object \| null |  |

### WorkingTimeDateSpan

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `start` | [LocalDate](#localdate) | yes |
| `start_half_day` | boolean | yes |
| `end` | [LocalDate](#localdate) | yes |
| `end_half_day` | boolean | yes |
| `notes` | string \| null | yes |
| `user` | [UserPartial](#userpartial) | yes |
| `working_time_type` | [WorkingTimeTypePartial](#workingtimetypepartial) | yes |
| `substitute` | [UserPartial](#userpartial) \| null |  |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |
| `metadata` | object \| null |  |

### WorkingTimeDateSpanCreate

| field | type | required |
|---|---|---|
| `user_id` | string | yes |
| `start` | [LocalDate](#localdate) | yes |
| `start_half_day` | boolean |  |
| `end` | [LocalDate](#localdate) | yes |
| `end_half_day` | boolean |  |
| `notes` | string \| null |  |
| `working_time_type_id` | string | yes |
| `substitute_id` | string \| null |  |
| `metadata` | object \| null |  |

### WorkingTimeDateSpanPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [WorkingTimeDateSpan](#workingtimedatespan)[] | yes |

### WorkingTimeDateSpanPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |

### WorkingTimeDateSpanUpdate

| field | type | required |
|---|---|---|
| `start` | [LocalDate](#localdate) |  |
| `start_half_day` | boolean |  |
| `end` | [LocalDate](#localdate) |  |
| `end_half_day` | boolean |  |
| `notes` | string \| null |  |
| `working_time_type_id` | string |  |
| `substitute_id` | string \| null |  |
| `metadata` | object \| null |  |

### WorkingTimeDateSpansSortColumn

_no documented fields_

### WorkingTimeRequest

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `start` | [LocalDate](#localdate) | yes |
| `start_half_day` | boolean | yes |
| `end` | [LocalDate](#localdate) | yes |
| `end_half_day` | boolean | yes |
| `notes` | string \| null | yes |
| `user` | [UserPartial](#userpartial) | yes |
| `working_time_type` | [WorkingTimeTypePartial](#workingtimetypepartial) | yes |
| `substitute` | [UserPartial](#userpartial) \| null |  |
| `created` | [DateTime](#datetime) | yes |
| `last_modified` | [DateTime](#datetime) | yes |
| `last_modified_by` | [UserPartial](#userpartial) \| null | yes |
| `status_comment` | string | yes |
| `status` | [WorkingTimeRequestStatus](#workingtimerequeststatus) | yes |

### WorkingTimeRequestPartial

| field | type | required |
|---|---|---|
| `id` | string | yes |

### WorkingTimeRequestStatus

_no documented fields_

### WorkingTimeRequestsPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [WorkingTimeRequest](#workingtimerequest)[] | yes |

### WorkingTimeRequestsSortColumn

_no documented fields_

### WorkingTimeRules

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |

### WorkingTimeStatus

_no documented fields_

### WorkingTimeType

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `short_name` | string \| null | yes |
| `description` | string \| null | yes |
| `external_id` | string \| null | yes |
| `edit_unit` | [DurationUnit](#durationunit) | yes |
| `category` | [WorkingTimeTypeCategory](#workingtimetypecategory) | yes |
| `sub_category` | [WorkingTimeTypeSubCategory](#workingtimetypesubcategory) \| null | yes |
| `recording_mode_user` | [RecordingModeUser](#recordingmodeuser) \| null | yes |
| `non_creditable_deductible` | number \| null | yes |
| `compensation_deductible` | number \| null | yes |
| `archived` | boolean | yes |
| `requires_substitute` | boolean |  |
| `automatic_break_deduction_policy` | [AutomaticBreakDeductionPolicy](#automaticbreakdeductionpolicy) | yes |

### WorkingTimeTypeCategory

_no documented fields_

### WorkingTimeTypePartial

| field | type | required |
|---|---|---|
| `id` | string | yes |
| `name` | string | yes |
| `external_id` | string \| null | yes |

### WorkingTimeTypeSubCategory

_no documented fields_

### WorkingTimeTypesPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [WorkingTimeType](#workingtimetype)[] | yes |

### WorkingTimeTypesSortColumn

_no documented fields_

### WorkingTimeUpdate

| field | type | required |
|---|---|---|
| `start` | [DateTime](#datetime) |  |
| `end` | [DateTime](#datetime) \| null |  |
| `break_times` | [BreakTimeUpdate](#breaktimeupdate)[] |  |
| `duration_type` | [DurationType](#durationtype) \| null |  |
| `changed` | boolean |  |
| `notes` | string \| null |  |
| `working_time_type_id` | string |  |
| `start_location` | [Location](#location) \| null |  |
| `end_location` | [Location](#location) \| null |  |
| `status` | [WorkingTimeStatus](#workingtimestatus) |  |
| `metadata` | object \| null |  |

### WorkingTimesPage

| field | type | required |
|---|---|---|
| `next_page_token` | string \| null | yes |
| `data` | [WorkingTime](#workingtime)[] | yes |

### WorkingTimesSortColumn

_no documented fields_
