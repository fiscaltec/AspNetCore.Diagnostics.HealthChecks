﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

namespace HealthChecks.UI.Configuration
{
    public class Options
    {
        internal ICollection<string> CustomStylesheets { get;  }= new List<string>();
        public string UIPath { get; set; } = "/healthchecks-ui";
        public string ApiPath { get; set; } = "/healthchecks-api";
        public bool UseRelativeApiPath = true;
        public string WebhookPath { get; set; } = "/healthchecks-webhooks";
        public bool UseRelativeWebhookPath = true;
        public string ResourcesPath { get; set; } = "/ui/resources";
        public bool UseRelativeResourcesPath = true;
        public bool AsideMenuOpened { get; set; } = true;
        public ClientOptions ClientOptions { get; set; } = new ClientOptions();

        public Options AddCustomStylesheet(string path)
        {
            var stylesheetPath = Path.Combine(Environment.CurrentDirectory, path);
            
            if (!File.Exists(stylesheetPath))
            {
                throw new Exception($"Could not find style sheet at path {stylesheetPath}");
            }
            
            CustomStylesheets.Add(stylesheetPath);
            
            return this;
        }
    }

    public class ClientOptions
    {
        public int DefaultPollingIntervalSeconds { get; set; } = 10;
        public int MinimumPollingIntervalSeconds { get; set; } = 1;
        public bool HidePollingIntervalControl { get; set; }
    }
}
