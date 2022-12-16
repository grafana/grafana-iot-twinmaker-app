//go:build mage
// +build mage

package main

import (
	"github.com/magefile/mage/sh"

	// mage:import
	build "github.com/grafana/grafana-plugin-sdk-go/build"
)

// Drone signs the Drone configuration file
// This needs to be run every time the drone.yml file is modified
// See https://github.com/grafana/deployment_tools/blob/master/docs/infrastructure/drone/signing.md for more info
func Drone() error {
	if err := sh.RunV("drone", "lint"); err != nil {
		return err
	}

	if err := sh.RunV("drone", "--server", "https://drone.grafana.net", "sign", "--save", "grafana/grafana-iot-twinmaker-app"); err != nil {
		return err
	}

	return nil
}

// Default configures the default target.
var Default = build.BuildAll
