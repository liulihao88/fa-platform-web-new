import { propTypes } from "@/utils/propTypes";

export const cronEmits = ["change", "update:value", "update:modelValue"];
export const cronProps = {
  value: propTypes.string.def(""),
  disabled: propTypes.bool.def(false),
  hideSecond: propTypes.bool.def(false),
  hideYear: propTypes.bool.def(false),
  remote: propTypes.func,
  modelValue: propTypes.string.def("")
};
