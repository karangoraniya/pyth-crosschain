import * as Icon from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/react";

import { Button as ButtonComponent, VARIANTS, SIZES } from "./index.js";

const meta = {
  component: ButtonComponent,
  argTypes: {
    children: {
      control: "text",
      table: {
        category: "Contents",
      },
    },
    isDisabled: {
      control: "boolean",
      table: {
        category: "State",
      },
    },
    variant: {
      control: "inline-radio",
      options: VARIANTS,
      table: {
        category: "Variant",
      },
    },
    size: {
      control: "inline-radio",
      options: SIZES,
      table: {
        category: "Variant",
      },
    },
    rounded: {
      control: "boolean",
      table: {
        category: "Variant",
      },
    },
    hideText: {
      control: "boolean",
      table: {
        category: "Contents",
      },
    },
    beforeIcon: {
      control: "select",
      options: Object.keys(Icon),
      mapping: Icon,
      table: {
        category: "Contents",
      },
    },
    afterIcon: {
      control: "select",
      options: Object.keys(Icon),
      mapping: Icon,
      table: {
        category: "Contents",
      },
    },
    isPending: {
      control: "boolean",
      table: {
        category: "State",
      },
    },
    href: {
      control: "text",
      table: {
        category: "Link",
      },
    },
    target: {
      control: "text",
      table: {
        category: "Link",
      },
    },
  },
} satisfies Meta<typeof ButtonComponent>;
export default meta;

export const Button = {
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    isDisabled: false,
    isPending: false,
    rounded: false,
    hideText: false,
  },
  argTypes: {
    onPress: {
      table: {
        category: "Behavior",
      },
    },
  },
} satisfies StoryObj<typeof ButtonComponent>;

export const DrawerButton = {
  args: {
    children: "Open Drawer",
    variant: "primary",
    size: "md",
    isDisabled: false,
    isPending: false,
    rounded: false,
    hideText: false,
    drawer: {
      title: "Hello world",
      contents: "This is a drawer",
    },
  },
} satisfies StoryObj<typeof ButtonComponent>;

export const AlertButton = {
  args: {
    children: "Open Alert",
    variant: "primary",
    size: "md",
    isDisabled: false,
    isPending: false,
    rounded: false,
    hideText: false,
    alert: {
      title: "Alert!",
      contents: "This is an alert",
    },
  },
} satisfies StoryObj<typeof ButtonComponent>;
