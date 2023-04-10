type ControlButtonProps = {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    text: string;
};

function ControlButton({
    onClick,
    text,
    disabled = false,
}: ControlButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="0 border px-4 py-2 hover:bg-slate-200"
        >
            {text}
        </button>
    );
}

export default ControlButton;
