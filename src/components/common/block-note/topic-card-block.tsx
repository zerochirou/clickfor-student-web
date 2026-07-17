import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";

export const TopicCardBlock = createReactBlockSpec(
  {
    type: "topicCard",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      topicId: { default: "" },
      topicName: { default: "Unknown Topic" },
      topicDesc: { default: "" },
    },
    // Gunakan "none" karena blok ini berdiri sendiri (tidak memiliki anak teks rich-text)
    content: "none", 
  },
  {
    render: (props) => {
      return (
        <div
          // contentEditable={false} sangat penting agar cursor tidak masuk dan merusak UI card
          contentEditable={false} 
          className="border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-accent/50 cursor-pointer transition-all w-full my-2 bg-card text-card-foreground"
          onClick={() => {
            // Aksi saat card diklik, contohnya:
            alert(`Membuka topik: ${props.block.props.topicName}`);
            // window.open(`/topic/${props.block.props.topicId}`, "_blank");
          }}
        >
          <div className="font-semibold text-base mb-1">
            {props.block.props.topicName}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {props.block.props.topicDesc}
          </p>
        </div>
      );
    },
  }
);