import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useState } from "react";
export function Status({ error }: { error?: string }) {
	return (
		<p role="status" className={error ? "notice error" : "notice"}>
			{error || "Đang tải nội dung…"}
		</p>
	);
}
export function LoginLink() {
	const loc = useLocation();
	return (
		<Link className="btn" state={{ next: loc.pathname }} to="/login">
			Đăng nhập để tiếp tục
		</Link>
	);
}
export function Action({
	run,
	children,
	done,
	variant = "",
}: {
	run: () => Promise<unknown>;
	children: ReactNode;
	done?: string;
	variant?: string;
}) {
	const [busy, setBusy] = useState(false),
		[msg, setMsg] = useState("");
	return (
		<>
			<button
				type="button"
				className={variant}
				disabled={busy}
				onClick={async () => {
					setBusy(true);
					setMsg("");
					try {
						await run();
						setMsg(done || "");
					} catch (e) {
						setMsg((e as Error).message);
					} finally {
						setBusy(false);
					}
				}}
			>
				{busy ? "Đang xử lý…" : children}
			</button>
			{msg && <p role="status">{msg}</p>}
		</>
	);
}
export function PageTop({
	back = "/catalog",
	label = "Thư viện học tập",
	children,
}: {
	back?: string;
	label?: string;
	children: ReactNode;
}) {
	return (
		<>
			<Link className="back" to={back}>
				← {label}
			</Link>
			<h1>{children}</h1>
		</>
	);
}
