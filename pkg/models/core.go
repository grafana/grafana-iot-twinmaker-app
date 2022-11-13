package models

// TwinMakerCustomMeta is the standard metadata
type SelectableString struct {
	Label       string `json:"label"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
}

type SelectablePropGroup struct {
	SelectableString
	Props []SelectableString `json:"props,omitempty"`
}

type SelectableProps struct {
	SelectableString
	TimeSeries []SelectableString    `json:"timeSeries,omitempty"`
	Props      []SelectableString    `json:"props,omitempty"`
	PropGroups []SelectablePropGroup `json:"propGroups,omitempty"`
	IsAlarm    bool                  `json:"isAlarm,omitempty"`
	IsAbstract bool                  `json:"isAbstract,omitempty"`
}

type OptionsInfo struct {
	Entities   []SelectableString `json:"entities,omitempty"`
	Components []SelectableProps  `json:"components,omitempty"`
	Properties []SelectableString `json:"properties,omitempty"`
}
