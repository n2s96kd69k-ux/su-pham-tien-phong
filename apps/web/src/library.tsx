import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { api, useResource } from "./client";
import { Action, LoginLink, PageTop, Status } from "./shared";
import type { CatalogItem, Lesson } from "../../../packages/contracts";
export function Catalog() {
	const { data, error } = useResource<CatalogItem[]>("/catalog"),
		[term, setTerm] = useState("");
	const entries = data?.filter((l) =>
		`${l.title} ${l.subject} ${l.course}`
			.toLocaleLowerCase("vi")
			.includes(term.trim().toLocaleLowerCase("vi")),
	);
	return (
		<>
			<section className="hero">
				<div>
					<p className="eyebrow">Không gian học tập</p>
					<h1>
						Thư viện
						<br />
						<em>học tập.</em>
					</h1>
					<p>
						Khám phá bài học, tự kiểm tra kiến thức và luyện tập theo từng chủ
						đề.
					</p>
					<button
						type="button"
						className="btn cream"
						onClick={() => {
							document.getElementById("search")?.focus();
						}}
					>
						Tìm bài học <span>↓</span>
					</button>
				</div>
				<figure className="visual">
					<figcaption>
						Số sách cho mượn <small>Ví dụ minh họa · cuốn</small>
					</figcaption>
					<div className="bars">
						{[12, 18, 15].map((v, i) => (
							<div key={v}>
								<b>{v}</b>
								<i style={{ height: v * 6 }} />
								<span>{["Thứ Hai", "Thứ Ba", "Thứ Tư"][i]}</span>
							</div>
						))}
					</div>
				</figure>
			</section>
			<section id="lessons" className="index">
				<div className="section-head">
					<div>
						<p className="eyebrow">Danh mục học liệu</p>
						<h2>Bài học đã xuất bản</h2>
					</div>
					<label className="search">
						<span aria-hidden="true">⌕</span>
						<input
							id="search"
							aria-label="Tìm bài học"
							placeholder="Tìm bài học, chủ đề…"
							value={term}
							onChange={(e) => setTerm(e.target.value)}
						/>
					</label>
				</div>
				{!data ? (
					<Status error={error} />
				) : entries?.length ? (
					entries.map((l) => (
						<Link className="library-row" key={l.id} to={`/lessons/${l.id}`}>
							<div className="book-icon" aria-hidden="true">
								▤
							</div>
							<div>
								<small>
									{l.subject} / {l.course}
								</small>
								<h3>{l.title}</h3>
							</div>
							<span className="row-arrow">↗</span>
						</Link>
					))
				) : (
					<p>Chưa có bài học phù hợp.</p>
				)}
			</section>
		</>
	);
}
export function Reader({ signed }: { signed: boolean }) {
	const { id } = useParams(),
		{ data: l, error } = useResource<Lesson>(`/lessons/${id}`),
		{ data: health } = useResource<{ tutor: boolean }>("/health");
	const nav = useNavigate(),
		[hint, setHint] = useState(""),
		[report, setReport] = useState("");
	if (!l) return <Status error={error} />;
	return (
		<article className="reader">
			<PageTop>{l.title}</PageTop>
			<p className="meta">
				{l.subject} · {l.course} · Phiên bản {l.version}
			</p>
			<section className="objective">
				<h2>Mục tiêu bài học</h2>
				<p>{l.body.objective}</p>
			</section>
			<h2>Hiểu khái niệm</h2>
			<p>{l.body.reading}</p>
			<h2>Ví dụ</h2>
			<p>{l.body.example}</p>
			<section className="paper">
				<h2>Tự kiểm tra</h2>
				<p>{l.body.practice}</p>
				<details>
					<summary>Xem gợi ý và đối chiếu</summary>
					<p>{l.body.hint}</p>
				</details>
			</section>
			{signed ? (
				<Action
					run={() => api(`/me/lessons/${id}/complete`, {})}
					done="Đã ghi nhận trong tiến độ của bạn."
				>
					Đánh dấu đã học
				</Action>
			) : (
				<LoginLink />
			)}
			{l.exams.map((e) => (
				<section className="paper" key={e.id}>
					<p className="eyebrow">Luyện tập</p>
					<h2>{e.title}</h2>
					<p>
						{e.count} câu · {e.minutes} phút · Mỗi câu đúng được 1 điểm. Bạn có
						thể sửa đáp án đến khi nộp. Khi hết giờ, hệ thống chấm các lựa chọn
						đã lưu.
					</p>
					{signed ? (
						<Action
							run={async () => {
								const a = await api<{ id: string }>(
									`/me/exams/${e.id}/start`,
									{},
								);
								nav(`/attempts/${a.id}`);
							}}
						>
							Bắt đầu làm bài
						</Action>
					) : (
						<LoginLink />
					)}
				</section>
			))}
			<details>
				<summary>Trợ giảng AI</summary>
				{health?.tutor ? (
					signed ? (
						<>
							<p>Gợi ý dựa trên bài học này và có thể có sai sót.</p>
							<Action
								run={async () =>
									setHint(
										(await api<{ hint: string }>(`/me/lessons/${id}/hint`, {}))
											.hint,
									)
								}
							>
								Xin gợi ý
							</Action>
							<p>{hint}</p>
						</>
					) : (
						<LoginLink />
					)
				) : (
					<p>Trợ giảng AI chưa được kích hoạt.</p>
				)}
			</details>
			{signed && (
				<details>
					<summary>Báo lỗi nội dung</summary>
					<label>
						Nội dung cần xem lại
						<textarea
							value={report}
							onChange={(e) => setReport(e.target.value)}
						/>
					</label>
					<Action
						run={async () => {
							await api("/me/reports", { lesson: id, message: report });
							setReport("");
						}}
						done="Đã gửi đến biên tập viên."
					>
						Gửi báo lỗi
					</Action>
				</details>
			)}
		</article>
	);
}
