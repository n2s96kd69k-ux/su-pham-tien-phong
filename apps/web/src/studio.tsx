import { useState } from "react";
import type { StudioItem, Profile } from "../../../packages/contracts";
import { api, useResource } from "./client";
import { Action, PageTop, Status } from "./shared";
const fields = {
	objective: "Mục tiêu",
	reading: "Nội dung bài học",
	example: "Ví dụ",
	practice: "Bài luyện",
	hint: "Gợi ý đối chiếu",
};
function Editor({ item, onSaved }: { item?: StudioItem; onSaved: () => void }) {
	const [kind, setKind] = useState<StudioItem["kind"]>(item?.kind || "lesson"),
		[title, setTitle] = useState(item?.title || ""),
		[preview, setPreview] = useState(false);
	const base = item?.body;
	const [lesson, setLesson] = useState(
		base && "objective" in base
			? base
			: { objective: "", reading: "", example: "", practice: "", hint: "" },
	);
	const q = base && "options" in base ? base : null;
	const [choices, setChoices] = useState(q?.options.join("\n") || ""),
		[correct, setCorrect] = useState((q?.correct ?? 0) + 1),
		[explain, setExplain] = useState(q?.explanation || "");
	const options = choices
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);
	const edit = item?.state === "draft";
	return (
		<section className="paper">
			<h2>
				{edit
					? "Chỉnh sửa bản nháp"
					: item
						? "Soạn phiên bản tiếp theo"
						: "Soạn bản nháp"}
			</h2>
			{!item && (
				<label>
					Loại học liệu
					<select
						value={kind}
						onChange={(e) => setKind(e.target.value as StudioItem["kind"])}
					>
						<option value="lesson">Bài học</option>
						<option value="question">Câu hỏi trắc nghiệm</option>
					</select>
				</label>
			)}
			<label>
				Tiêu đề
				<textarea value={title} onChange={(e) => setTitle(e.target.value)} />
			</label>
			{kind === "lesson" ? (
				Object.entries(fields).map(([k, label]) => (
					<label key={k}>
						{label}
						<textarea
							value={lesson[k as keyof typeof lesson]}
							onChange={(e) => setLesson({ ...lesson, [k]: e.target.value })}
						/>
					</label>
				))
			) : (
				<>
					<label>
						Các lựa chọn (mỗi dòng một lựa chọn)
						<textarea
							value={choices}
							onChange={(e) => setChoices(e.target.value)}
						/>
					</label>
					<label>
						Số thứ tự đáp án đúng
						<input
							type="number"
							min="1"
							max={options.length || 1}
							value={correct}
							onChange={(e) => setCorrect(Number(e.target.value))}
						/>
					</label>
					<label>
						Lời giải
						<textarea
							value={explain}
							onChange={(e) => setExplain(e.target.value)}
						/>
					</label>
				</>
			)}
			<button
				type="button"
				className="plain"
				onClick={() => setPreview(!preview)}
			>
				{preview ? "Đóng bản xem trước" : "Xem trước"}
			</button>{" "}
			<Action
				run={async () => {
					await api(
						`/me/studio${edit ? `/${item.id}` : ""}`,
						{
							kind,
							title,
							course_id: item?.course_id || "data",
							previous: item && !edit ? item.id : undefined,
							body:
								kind === "lesson"
									? lesson
									: { options, correct: correct - 1, explanation: explain },
						},
						edit ? "PUT" : "POST",
					);
					onSaved();
				}}
			>
				Lưu bản nháp
			</Action>
			{preview && (
				<article className="objective">
					<h3>{title}</h3>
					{(kind === "lesson" ? Object.values(lesson) : options).map((s, i) => (
						<p key={i}>{s}</p>
					))}
				</article>
			)}
		</section>
	);
}
export function Studio({ profile }: { profile: Profile }) {
	const [revision, refresh] = useState(0),
		[open, setOpen] = useState<StudioItem | null | undefined>();
	const { data, error } = useResource<StudioItem[]>("/me/studio", revision);
	const editor = profile.role === "editor" || profile.role === "admin";
	const { data: reports, error: reportError } = useResource<
		{ id: string; message: string; resolved: boolean; title: string }[]
	>(editor ? "/me/reports" : null, revision);
	const [examTitle, setTitle] = useState(""),
		[lesson, setLesson] = useState(""),
		[questions, setQuestions] = useState<string[]>([]),
		[minutes, setMinutes] = useState(10);
	function reload() {
		setOpen(undefined);
		refresh((r) => r + 1);
	}
	if (!data) return <Status error={error} />;
	const published = data.filter((d) => d.state === "published");
	return (
		<article className="reader">
			<PageTop>Phòng biên tập</PageTop>
			<button type="button" onClick={() => setOpen(null)}>
				Soạn học liệu
			</button>
			{open !== undefined && (
				<Editor
					key={open?.id || "new"}
					item={open || undefined}
					onSaved={reload}
				/>
			)}
			<h2>Học liệu và hàng chờ duyệt</h2>
			{data.map((d) => (
				<details key={d.id}>
					<summary>
						{d.title} · v{d.version} ·{" "}
						{
							{
								draft: "Bản nháp",
								review: "Chờ duyệt",
								published: "Đã xuất bản",
							}[d.state]
						}
					</summary>
					{Object.entries(d.body).map(([key, v]) => (
						<p key={key}>
							<b>
								{
									(
										{
											...fields,
											options: "Lựa chọn",
											correct: "Số thứ tự đáp án",
											explanation: "Lời giải",
										} as Record<string, string>
									)[key]
								}
							</b>{" "}
							·{" "}
							{Array.isArray(v)
								? v.join(" / ")
								: key === "correct"
									? Number(v) + 1
									: String(v)}
						</p>
					))}
					{(d.state === "published" ||
						(d.state === "draft" && d.author === profile.id)) && (
						<button
							type="button"
							className="plain"
							onClick={() => {
								setOpen(d);
								window.scrollTo(0, 0);
							}}
						>
							{d.state === "draft" ? "Chỉnh sửa" : "Tạo phiên bản mới"}
						</button>
					)}{" "}
					{((d.state === "draft" && d.author === profile.id) ||
						(editor && d.state === "review" && d.author !== profile.id)) && (
						<Action
							run={async () => {
								await api(
									`/me/studio/${d.id}/${d.state === "draft" ? "review" : "publish"}`,
									{},
								);
								reload();
							}}
						>
							{d.state === "draft" ? "Gửi duyệt" : "Duyệt và xuất bản"}
						</Action>
					)}
				</details>
			))}
			{editor && (
				<>
					<section className="paper">
						<h2>Tạo đề từ học liệu đã duyệt</h2>
						<label>
							Tên đề
							<input
								value={examTitle}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</label>
						<label>
							Bài học
							<select
								value={lesson}
								onChange={(e) => setLesson(e.target.value)}
							>
								<option value="">Chọn bài học</option>
								{published
									.filter((d) => d.kind === "lesson")
									.map((d) => (
										<option value={d.id} key={d.id}>
											{d.title} · v{d.version}
										</option>
									))}
							</select>
						</label>
						<label>
							Thời gian (phút)
							<input
								type="number"
								min="1"
								max="180"
								value={minutes}
								onChange={(e) => setMinutes(Number(e.target.value))}
							/>
						</label>
						{published
							.filter((d) => d.kind === "question")
							.map((d) => (
								<label className="option" key={d.id}>
									<input
										type="checkbox"
										checked={questions.includes(d.id)}
										onChange={(e) =>
											setQuestions(
												e.target.checked
													? [...questions, d.id]
													: questions.filter((q) => q !== d.id),
											)
										}
									/>
									{d.title} · v{d.version}
								</label>
							))}
						<Action
							run={async () => {
								await api("/me/exams", {
									title: examTitle,
									lesson,
									questions,
									minutes,
								});
								setTitle("");
								setQuestions([]);
							}}
							done="Đã xuất bản đề cho bài học."
						>
							Xuất bản đề
						</Action>
					</section>
					<h2>Báo lỗi học liệu</h2>
					{reportError && <Status error={reportError} />}{" "}
					{reports?.length === 0 && <p>Chưa có báo lỗi.</p>}
					{reports?.map((r) => (
						<div className="paper" key={r.id}>
							<b>{r.title}</b>
							<p>{r.message}</p>
							{r.resolved ? (
								"Đã xử lý"
							) : (
								<Action
									run={async () => {
										await api(`/me/reports/${r.id}/resolve`, {});
										reload();
									}}
								>
									Đánh dấu đã xử lý
								</Action>
							)}
						</div>
					))}
				</>
			)}
		</article>
	);
}
