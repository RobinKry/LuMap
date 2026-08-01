/** Single-line text input — the Luma URL field in Settings is the only instance in the app. */
export interface TextFieldProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Renders at `--text-faint`. */
  placeholder?: string;
  style?: React.CSSProperties;
}
export declare function TextField(props: TextFieldProps): JSX.Element;
