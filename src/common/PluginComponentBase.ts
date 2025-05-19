import { FC } from "react";
import { PluginStateBase } from "./PluginStateBase";

export type PluginComponentBase<T extends PluginStateBase> = FC<{ state: T }>;
